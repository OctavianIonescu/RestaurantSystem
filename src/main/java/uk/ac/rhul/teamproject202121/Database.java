package uk.ac.rhul.teamproject202121;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.function.Consumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Wrapper class that provides the functionality we need for the database.
 * 
 * @author Team21
 *
 */
public class Database {
  static Connection connection = null;
  private static Database databaseInstance = null;


  /**
   * Constructor for the database. Attempts to connect to the database URL and displays an error
   * message if it fails, or can't make a connection.
   */
  private Database() {
    try {
      connection = DriverManager.getConnection(getUrl());
    } catch (SQLException e) {
      System.err.println(getUrl());
      e.printStackTrace();
      System.err.println(e.getMessage());
      connection = null;
    }
    // alert the user on error
    if (connection == null) {
      System.err.println("Failed to make connection!");

    }
  }

  /**
   * Get the database URL formated appropriately from the correct place.
   * 
   * @return the database URL.
   */
  private static String getUrl() {
    String out = System.getenv().get("DATABASE_URL");
    if (out == null) {
      out = System.getProperty("DATABASE_URL");
    }
    System.out.println(out);

    Matcher parts = Pattern.compile(":\\/\\/(.+):(.+)@(.+)$").matcher(out);
    parts.find();
    return "jdbc:postgresql://" + parts.group(3) + "?user=" + parts.group(1) + "&password="
        + parts.group(2);
  }

  /**
   * Method to execute a query upon the database.
   * 
   * @param query The query to be executed
   * @return The result of the query
   * @throws SQLException Since this is working with a database, SQLExceptions may be thrown
   */
  public ResultSet executeSelect(String query) throws SQLException {
    Statement st = null;
    st = connection.createStatement();
    ResultSet rs = null;
    rs = st.executeQuery(query);
    return rs;
  }

  /**
   * Method to execute a prepared statement on the database.
   * 
   * @param query The prepared to be executed
   * @return The result of the query
   * @throws SQLException Since this is working with a database, SQLExceptions may be thrown
   */
  public ResultSet executeSelect(String query, Consumer<PreparedStatement> setVals)
      throws SQLException {
    PreparedStatement ps = connection.prepareStatement(query);
    setVals.accept(ps);
    return ps.executeQuery();
  }

  /**
   * Method to execute a prepared statement that will update the database.
   * 
   * @param query The prepared statement to be executed
   * @throws SQLException Since this is working with a database, SQLExceptions may be thrown
   */
  public void executeUpdate(String query, Consumer<PreparedStatement> setVals) throws SQLException {
    PreparedStatement ps = connection.prepareStatement(query);
    setVals.accept(ps);
    ps.executeUpdate();
  }

  /**
   * Method to obtain the current database instance. This class is a singleton to avoid the
   * possibility of having two competing database instances.
   * 
   * @return the Database instance.
   */
  public static Database getDatabase() {
    if (databaseInstance == null) {
      databaseInstance = new Database();
    }
    return databaseInstance;
  }

  /**
   * The maximum size of a sql batch.
   */
  public static final int BATCHSIZE = 100;

  /**
   * Insert data into a table from a file.
   * 
   * @param table The name of the table to insert the data into
   * @param fileName the name of the file to get the data from. This path must start from the
   *        location of the class
   * @return the number of rows to be inserted from the file
   * @throws SQLException if there is a problem with inserting the data i.e connection closed
   * @throws IOException if the file cannot be found.
   */
  public int insertIntoTableFromFile(String table, String fileName)
      throws SQLException, IOException {
    int numRows = 0;
    String currentLine;
    Statement st = connection.createStatement();
    // this gets the file relative to where the class is loaded from
    // i couldn't use new File("./"+fileName) because the current working directory
    // is the base directory in eclipse.

    // **note for some dumb reason get Resource doesn't work when the program is packaged.**
    // we need to use get resource as stream.
    InputStream file = this.getClass().getClassLoader().getResourceAsStream(fileName);
    if (file == null) {
      throw new IOException("File not Found");

    }
    BufferedReader br = new BufferedReader(new InputStreamReader(file));

    // for every line in the file add it to the to the current batch
    // if the batch is full then send it
    while ((currentLine = br.readLine()) != null) {
      st.addBatch(sqlFromRow(table, currentLine));
      numRows += 1;
      if (numRows % BATCHSIZE == 0) {
        st.executeBatch();
      }
    }
    // send any left over data
    if (numRows % 100 != 0) {
      st.executeBatch();
    }
    // close off connections
    st.closeOnCompletion();
    br.close();
    return numRows;

  }

  /**
   * Creates the SQL statement for inserting a row of data from a line of comma separated values.
   * 
   * @param table the table to insert the row into
   * @param row the row's data. values should be separated by commas
   * @return the SQL statement for inserting this row.
   */
  private String sqlFromRow(String table, String row) {
    // build a string from the data.
    StringBuilder s = new StringBuilder("INSERT INTO ");
    s.append(table);
    s.append(" VALUES (");
    boolean first = true;
    row = row.replaceAll("'", "''");
    for (String part : row.split(",")) {
      if (first) {
        first = false;
      } else {
        s.append(",");
      }
      if (part.matches("-?\\d+(\\.\\d+)?")) {
        s.append(part);
        continue;
      }
      s.append("'");
      s.append(part);
      s.append("'");
    }
    s.append(");");
    return s.toString();
  }

  /**
   * Method to drop a table if it exists.
   * 
   * @param table the name of the table.
   * @throws SQLException there might be other tables that depend on this table. or connection
   *         issues etc.
   */
  public void dropTable(String table) throws SQLException {
    Statement st = connection.createStatement();
    st.execute("DROP TABLE IF EXISTS " + table);
    st.close();
  }


  /**
   * Creates a table with a given schema.
   * 
   * @param tableName the name of the table
   * @param tableDescription the schema of the data that the table is to contain.
   * @throws SQLException there could already be a table with this name. {@link dropTable}
   */
  public void createTable(String tableName, String tableDescription) throws SQLException {
    Statement st = connection.createStatement();
    st.execute("CREATE TABLE " + tableName + " (" + tableDescription + ");");
    st.close();
  }

  /**
   * Displays a result set to the user in a standard form. This method will return every row that is
   * in the result set so should be limited in the query if there are a large number of results
   * 
   * @param rs the result set to be shown
   * @param title the title of this result.
   * @throws SQLException if there is an issue in displaying the data.
   */
  public void printResultSet(ResultSet rs, String title) throws SQLException {
    System.out.println("################## " + title + " ###############");
    // print the title
    int columnCount = rs.getMetaData().getColumnCount();
    // find the number of columns
    while (rs.next()) { // loop through all of the rows printing them
      for (int i = 1; i <= columnCount; i++) { // print all the columns in the row.
        String val = rs.getString(i);
        if (val == null) {
          System.out.print("NULL"); // print out the null results
        } else {
          System.out.print(val + " ");
        }
      }
      System.out.print('\n'); // print each row on its own line.
    }
  }

  /**
   * *Used to obtain the connection to the database for use by other objects.
   * 
   * @return the database connection
   */
  public Connection getConnection() {
    return connection;
  }

  /**
   * Initialisation method that drops the tables, then creates them anew. It then loads in the
   * necessary information for them to adequately perform their desired functions.
   * 
   * @throws SQLException thrown because of testing.
   * @throws IOException Thrown when there is a issue with the connection to the database.
   */
  public static void init() throws SQLException, IOException {
    Database db = Database.getDatabase();
    //add crypto functions to the database 
    db.executeUpdate("CREATE EXTENSION IF NOT EXISTS pgcrypto;", val -> {
    });

    db.dropTable("Test");
    db.dropTable("testing");
    db.dropTable("IsInStock");
    db.dropTable("Meal_Ingredient");
    db.dropTable("Ingredient");
    db.dropTable("ingredient_type");
    db.dropTable("OrderItem");
    db.dropTable("Menu");
    db.dropTable("Category");
    db.dropTable("OrderTable");
    db.dropTable("Tab");
    db.dropTable("Tables");
    db.dropTable("Staff");
    db.dropTable("Branch");
    // comments used to keep line breaks when auto-formatted

    String branchSchema = String.join(" ", //
        "branch_id int,", //
        "branch_name varchar(100),", //
        "phone_number varchar(100),", //
        "PRIMARY KEY (branch_id)"//
    );
    db.createTable("Branch", branchSchema);

    String staffSchema = String.join(" ", //
        "staff_id int,", //
        "branch int,", //
        "first_name varchar(100),", //
        "surname varchar(100),", //
        "age int,", //
        "username varchar(100),", //
        "password varchar(100),", //
        "is_manager boolean,", //
        "loggedIn boolean,", //
        "PRIMARY KEY(staff_id),", //
        "FOREIGN KEY(branch)", //
        "REFERENCES Branch(branch_id)");
    db.createTable("Staff", staffSchema);

    String tableSchema = String.join(" ", //
        "branch_id int,", //
        "table_number int,", //
        "number_of_seats int,", //
        "request_waiter boolean,", //
        "foreign key(branch_id) references Branch(branch_id),", //
        "PRIMARY KEY(branch_id,table_number)"//
    );
    db.createTable("Tables", tableSchema);
    // Adding the required tables to the database
    String tabSchema = String.join(" ", //
        "tab_id SERIAL,", //
        "host int,", //
        "branch_id int,", //
        "table_number int,", //
        "is_paid boolean,", //
        "foreign key(branch_id,table_number) references Tables(branch_id,table_number),", //
        "foreign key(host) references Staff(staff_id),", //
        "PRIMARY KEY(tab_id)"//
    );
    db.createTable("Tab", tabSchema);
    String orderSchema = String.join(" ", //
        "order_id SERIAL PRIMARY KEY,", //
        "tab_id int,", //
        "time_requested timestamp,", //
        "time_ready timestamp,", //
        "time_delivered timestamp,", //
        "time_checked_on timestamp,", //
        "time_cleared timestamp,", //
        "foreign key (tab_id) references Tab(tab_id)"//
    );
    db.createTable("OrderTable", orderSchema);
    String categorySchema = String.join(" ", //
        "category_id int,", //
        "category_name varchar(100),", //
        "PRIMARY KEY(category_id)" //
    );
    db.createTable("Category", categorySchema);
    String ingredientTypeSchema = String.join(" ", //
        "type_id int,", //
        "name varchar(100),", //
        "PRIMARY KEY(type_id)" //
    );
    db.createTable("ingredient_type", ingredientTypeSchema);
    String menuSchema = String.join(" ", //
        "meal int,", //
        "category_id int ,", //
        "name varchar(40) UNIQUE,", //
        "description varchar(200),", //
        "picture varchar(60),", //
        "price int,", //
        "primary key(meal),", //
        "foreign key (category_id) references Category(category_id)"//
    );
    db.createTable("Menu", menuSchema);
    String orderItemSchema = String.join(" ", //
        "order_number SERIAL PRIMARY KEY,", //
        "order_id int,", //
        "name varchar(40),", //
        "quantity int,", //
        "foreign key(order_id) references OrderTable(order_id),", //
        "foreign key (name) references Menu(name)"//
    );
    db.createTable("OrderItem", orderItemSchema);

    String ingredientSchema = String.join(" ", //
        "name varchar(20),", //
        "type int,", //
        "is_allergen boolean,", //
        "kcal int,", //
        "primary key(name),", //
        "foreign key (type) references ingredient_type(type_id)"//
    );
    db.createTable("Ingredient", ingredientSchema);


    String mealIngredientSchema = String.join(" ", //
        "meal int,", //
        "ingredient varchar(20),", //
        "amount_in_grams int,", //
        "primary key(meal,ingredient),", //
        "foreign key(meal) references Menu(meal),", //
        "foreign key(ingredient) references Ingredient(name)"//
    );
    db.createTable("Meal_Ingredient", mealIngredientSchema);

    String stockSchema = String.join(" ", //
        "branch_id int,", //
        "meal_name varchar(40),", //
        "is_in_stock boolean,", //
        "new_price int,", //
        "PRIMARY KEY(branch_id, meal_name),", //
        "FOREIGN KEY (branch_id)", //
        "REFERENCES Branch(branch_id),", //
        "FOREIGN KEY (meal_name)", //
        "REFERENCES Menu(name)"//

    );
    db.createTable("IsInStock", stockSchema);


    // Adding the category file for classifying meals in menu
    String fileName = "cats.txt";
    db.insertIntoTableFromFile("Category", fileName);


    // add the types of ingredient into the database (the ingredient rely on this)

    fileName = "ingredient-types.txt";
    db.insertIntoTableFromFile("ingredient_type", fileName);

    // Adding the menu file contains menu details
    fileName = "menu.txt";
    db.insertIntoTableFromFile("Menu", fileName);


    // Adding the branches file contains details about different restaurant branches
    fileName = "branches.txt";
    db.insertIntoTableFromFile("Branch", fileName);

    // add the staff data
    fileName = "staff.txt";
    db.insertIntoTableFromFile("Staff", fileName);

    // Adding the ingredients file contains ingredient details
    fileName = "ingredients.txt";
    db.insertIntoTableFromFile("Ingredient", fileName);

    // Adding the meal_Ingredient file contains meal to ingredient information
    fileName = "meal_Ingredient.txt";
    db.insertIntoTableFromFile("Meal_Ingredient", fileName);

    // Adding the tables file contains table details for different restaurant branches
    fileName = "tables.txt";
    db.insertIntoTableFromFile("Tables", fileName);


    // add the data for isinStock
    Statement st = db.getConnection().createStatement();
    st.execute(String.join(" ", //
        "INSERT INTO isinstock", //
        "SELECT  branch_id, name,", //
        "(meal <= branch_id+5) as is_in_stock, ", //
        "null as new_price ", //
        "FROM branch, menu"));


  }

}
