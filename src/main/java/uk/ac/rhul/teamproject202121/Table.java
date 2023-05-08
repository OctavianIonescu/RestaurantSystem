package uk.ac.rhul.teamproject202121;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;

/**
 * Class to manage tables and their waiters.
 * 
 * @author team21
 *
 */
public class Table {
  public static final Database db = Database.getDatabase();
  // hashmap of each waiterid for each restaurant (waiterid, restaurant)
  // Will need to be populated from waiter logins
  private static HashMap<String, Integer> waiters = new HashMap<String, Integer>();
  // hashmap of the id of the waiter assigned to the restaurant table (restauranttable, waiterid)
  private static HashMap<String, String> assignments = new HashMap<String, String>();
  // hashmap of the index of the next waiter for each restaurant (restaurantid, nextwaiterindex)
  private static HashMap<Integer, Integer> nextWaiter = new HashMap<Integer, Integer>();


  /**
   * Used to add a waiter to the list of available waiters.
   * 
   * @param res the branchID
   * @param waiterId the id of the waiter
   */
  public static void addWaiter(String waiterId, Integer res) {
    waiters.put(waiterId, res);
  }



  /**
   * Used to get all the waiters in a given restaurant.
   * 
   * @param res the restaurant id
   * @return an array list containing the waiter id's
   */
  public static ArrayList<String> getWaiters(Integer res) {
    ArrayList<String> restaurantWaiters = new ArrayList<String>();
    for (String i : waiters.keySet()) {
      if (waiters.get(i).equals(res)) {
        restaurantWaiters.add(i);
      }
    }
    return restaurantWaiters;
  }

  
  /** 
   * Gets the best staff memeber for a new table.
   * @param branchID the branch to get the waiter
   * @return Long the staffid of the new waiter
   * @throws Exception if there is an error getting a waiter i.e noone logged in.
   */
  public static Long getAvalibleStaffID(long branchID) throws Exception {
    String request = String.join("\n", //
        "SELECT staff_id", //
        "FROM staff", //
        "LEFT JOIN tab", //
        "ON staff_id=host", //
        "AND NOT coalesce(tab.is_paid,false)", //
        "WHERE branch = ?", //
        "AND loggedIn", //
        "AND NOT is_manager", //
        "GROUP BY staff_id", //
        "ORDER BY count(tab_id) ASC", //
        "LIMIT 1" //
    );
    ResultSet data = db.executeSelect(request, ps -> {
      try {
        ps.setLong(1, branchID);
      } catch (SQLException e) {
        e.printStackTrace();
      }
    });
    if (data.next()) {
      return data.getLong(1);
    }
    System.out.println(request);
    throw new Exception("no waiters");
  }

  /**
   * Method to assign a waiter to a table.
   * 
   * @param res the branchID
   * @param table the number of the table
   */
  public static String assignTableWaiter(Integer res, Integer table) {
    ArrayList<String> availableWaiters = getWaiters(res);
    Integer waiter = nextWaiter.get(res);
    if (waiter == null) {
      nextWaiter.put(res, 0);
      waiter = 0;
    }
    String waiterId = availableWaiters.get(waiter);
    String restaurantTable = "r" + res.toString() + "t" + table.toString();
    assignments.put(restaurantTable, waiterId);
    // the following sets up for the next call
    waiter += 1;
    if (waiter >= availableWaiters.size()) {
      waiter = 0;
    }
    nextWaiter.put(res, waiter);
    return waiterId;
  }


  /**
   * Checks if a given table in a restaurant has a waiter; and if it doesn't, assigns a waiter.
   * 
   * @param res the branchID
   * @param table the table number
   */
  public static String checkWaiter(Integer res, Integer table) {
    String resTable = "r" + res.toString() + "t" + table.toString();
    String waiter = assignments.get(resTable);
    if (waiter == null) {
      waiter = assignTableWaiter(res, table);
    }
    return waiter;
  }

  /**
   * Method to remove a table assignment upon completion of their time at the restaurant.
   * 
   * @param restaurant the branchID
   * @param table the table number
   */
  public static void setComplete(Integer restaurant, Integer table) {
    String resTable = "r" + restaurant.toString() + "t" + table.toString();
    assignments.remove(resTable);
  }


  /**
   * Get the tables assigned to a waiter.
   * 
   * @param waiter the waiter's user name
   * @return String an array of tables
   */
  public static String getTablesForWaiter(String waiter) {
    String yourTables = "[";
    for (String i : assignments.keySet()) {
      if (assignments.get(i).equals(waiter)) {
        String table = (i.substring(i.lastIndexOf("t") + 1));
        yourTables = yourTables + (table) + ", ";
      }
    }
    if (yourTables.substring(yourTables.length() - 1).equals(" ")) {
      yourTables = (yourTables.substring(0, yourTables.length() - 2));
    }
    yourTables = yourTables + "]";
    return yourTables;
  }
}
