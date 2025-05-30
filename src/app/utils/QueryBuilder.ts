// Define types for the request object and its properties
interface RequestObject {
  rowGroupCols: RowGroupCol[];
  valueCols: ValueCol[];
  groupKeys: string[];
  startRow: number;
  endRow: number;
  filterModel?: { [key: string]: FilterItem };
  sortModel?: SortModelItem[];
  tableName: string;
}

interface RowGroupCol {
  field: string;
  id: string;
}

interface ValueCol {
  field: string;
  aggFunc: string;
}

interface FilterItem {
  filterType: 'text' | 'number';
  type: string;
  filter: string | number;
  filterTo?: number;
}

interface SortModelItem {
  colId: string;
  sort: string;
}

export class QueryBuilder {

  public static getRowsSql(request: RequestObject): string {

    const selectSql = this.createSelectSql(request);
    const fromSql = this.createFromSql(request);
    const whereSql = this.createWhereSql(request);
    const limitSql = this.createLimitSql(request);

    const orderBySql = this.createOrderBySql(request);
    const groupBySql = this.createGroupBySql(request);

    const SQL = selectSql + fromSql + whereSql + groupBySql + orderBySql + limitSql;

    console.log(SQL);

    return SQL;
  }

  private static createFromSql(request: RequestObject): string {
    const tableName = request.tableName;
    return ' FROM ' + tableName;
  }

  private static createSelectSql(request: RequestObject): string {
    const rowGroupCols = request.rowGroupCols;
    const valueCols = request.valueCols;
    const groupKeys = request.groupKeys;

    if (this.isDoingGrouping(rowGroupCols, groupKeys)) {
      const colsToSelect = [];

      const rowGroupCol = rowGroupCols[groupKeys.length];
      colsToSelect.push(rowGroupCol.field);

      valueCols.forEach(function (valueCol: ValueCol) {
        colsToSelect.push(valueCol.aggFunc + '(' + valueCol.field + ') as ' + valueCol.field);
      });

      return ' select ' + colsToSelect.join(', ');
    }

    return ' select *';
  }

  private static createFilterSql(key: string, item: FilterItem): string {
    switch (item.filterType) {
      case 'text':
        return this.createTextFilterSql(key, item);
      case 'number':
        return this.createNumberFilterSql(key, item);
      default:
        console.log('unkonwn filter type: ' + item.filterType);
        return 'true';
    }
  }

  private static createNumberFilterSql(key: string, item: FilterItem): string {
    switch (item.type) {
      case 'equals':
        return key + ' = ' + item.filter;
      case 'notEqual':
        return key + ' != ' + item.filter;
      case 'greaterThan':
        return key + ' > ' + item.filter;
      case 'greaterThanOrEqual':
        return key + ' >= ' + item.filter;
      case 'lessThan':
        return key + ' < ' + item.filter;
      case 'lessThanOrEqual':
        return key + ' <= ' + item.filter;
      case 'inRange':
        return '(' + key + ' >= ' + item.filter + ' and ' + key + ' <= ' + item.filterTo + ')';
      default:
        console.log('unknown number filter type: ' + item.type);
        return 'true';
    }
  }

  private static createTextFilterSql(key: string, item: FilterItem): string {
    switch (item.type) {
      case 'equals':
        return key + ' = "' + item.filter + '"';
      case 'notEqual':
        return key + ' != "' + item.filter + '"';
      case 'contains':
        return key + ' like "%' + item.filter + '%"';
      case 'notContains':
        return key + ' not like "%' + item.filter + '%"';
      case 'startsWith':
        return key + ' like "' + item.filter + '%"';
      case 'endsWith':
        return key + ' like "%' + item.filter + '"';
      default:
        console.log('unknown text filter type: ' + item.type);
        return 'true';
    }
  }

  private static createWhereSql(request: RequestObject): string {
    const rowGroupCols = request.rowGroupCols;
    const groupKeys = request.groupKeys;
    const filterModel = request.filterModel;

    const that = this;
    const whereParts: string[] = [];

    if (groupKeys.length > 0) {
      groupKeys.forEach(function (key, index) {
        const colName = rowGroupCols[index].field;
        whereParts.push(colName + ' = "' + key + '"')
      });
    }

    if (filterModel) {
      const keySet = Object.keys(filterModel);
      keySet.forEach(function (key) {
        const item = filterModel[key];
        whereParts.push(that.createFilterSql(key, item));
      });
    }

    if (whereParts.length > 0) {
      return ' where ' + whereParts.join(' and ');
    } else {
      return '';
    }
  }

  private static createGroupBySql(request: RequestObject): string {
    const rowGroupCols = request.rowGroupCols;
    const groupKeys = request.groupKeys;

    if (this.isDoingGrouping(rowGroupCols, groupKeys)) {
      const colsToGroupBy = [];

      const rowGroupCol = rowGroupCols[groupKeys.length];
      colsToGroupBy.push(rowGroupCol.field);

      return ' group by ' + colsToGroupBy.join(', ');
    } else {
      // select all columns
      return '';
    }
  }

  private static createOrderBySql(request: RequestObject): string {
    const rowGroupCols = request.rowGroupCols;
    const groupKeys = request.groupKeys;
    const sortModel = request.sortModel;

    const grouping = this.isDoingGrouping(rowGroupCols, groupKeys);

    const sortParts: string[] = [];
    if (sortModel) {

      const groupColIds =
        rowGroupCols.map(groupCol => groupCol.id)
          .slice(0, groupKeys.length + 1);

      sortModel.forEach(function (item) {
        if (grouping && groupColIds.indexOf(item.colId) < 0) {
          // ignore
        } else {
          sortParts.push(item.colId + ' ' + item.sort);
        }
      });
    }

    if (sortParts.length > 0) {
      return ' order by ' + sortParts.join(', ');
    } else {
      return '';
    }
  }

  private static createLimitSql(request: RequestObject): string {
    const startRow = request.startRow;
    const endRow = request.endRow;
    const pageSize = endRow - startRow;
    return ' limit ' + (pageSize + 1) + ' offset ' + startRow;
  }

  private static isDoingGrouping(rowGroupCols: RowGroupCol[], groupKeys: string[]): boolean {
    // we are not doing grouping if at the lowest level. we are at the lowest level
    // if we are grouping by more columns than we have keys for (that means the user
    // has not expanded a lowest level group, OR we are not grouping at all).
    return rowGroupCols.length > groupKeys.length;
  }

} 