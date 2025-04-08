## Download and Install

Clone the example project using git clone and navigate into the project directory.

Install project dependencies and build project using:

```
pnpm install
```

## Database Setup

Download and install the database as per the [MySQL Download](https://www.mysql.com/downloads/) documentation.

Create a database with the name `'sample_data'`. Then run the following script to create the table `olympic_winners` and populate it with data via the MySQL command line:
```sql
mysql -u root -p -D sample_data < ./data/olympic_winners.sql
```
That's it! We are now ready to run and explore the application.

## Running the application

To run the application execute the following from the command line:

```bash
pnpm start
```
Then point your browser to [http://localhost:3000/](http://localhost:3000/)