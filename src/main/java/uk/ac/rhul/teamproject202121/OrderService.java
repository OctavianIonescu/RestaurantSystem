package uk.ac.rhul.teamproject202121;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Iterator;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Class for the management of adding orders and managing appropriate responses to them.
 * 
 * @author Team21
 *
 */
@Service
public class OrderService {
  private static final Database db = Database.getDatabase();


  /**
   * Gets the tab id for the table if there is one that isn't paid.
   * 
   * @param tableNumber the table the tab is for.
   * @return Long the tabid or null if there is no match
   * @throws SQLException if there is an error with the request
   */
  public static Long getTabID(long branchID, long tableNumber) throws SQLException {
    String request = String.join(" ", //
        "SELECT tab.tab_id", //
        "From tab", //
        "Where tab.is_paid = FALSE", //
        "AND tab.table_number =", //
        Long.toString(tableNumber), //
        "AND tab.branch_id =", //
        Long.toString(branchID), //
        "LIMIT 1");
    ResultSet data = db.executeSelect(request);
    if (data.next()) {
      return data.getLong(1);
    }
    return null;
  }


  @Autowired
  Update updater;

  /**
   * Used to store items ordered in the database.
   * 
   * @param branchID the branch id of the restaurant0
   * @param tableNumber the table number the order is being placed from
   * @param items an array of objects that contain the meal names and the quntity
   * @throws Exception if there is an error with the request
   */
  public void store(long branchID, long tableNumber, JSONArray items) throws Exception {
    // add order to the database
    Long tabID = getTabID(branchID, tableNumber);

    if (tabID == null) {
      String request = String.join(" ", //
          "INSERT INTO Tab (tab_id,branch_id, table_number, host, is_paid) VALUES(", //
          "DEFAULT,", //
          Long.toString(branchID), //
          ",", //
          Long.toString(tableNumber), //
          ", ?, FALSE)", //
          "RETURNING tab_id;" //
      );
      Long host = Table.getAvalibleStaffID(branchID);
      ResultSet row = db.executeSelect(request, (ps) -> {
        try {
          ps.setLong(1, host);
        } catch (SQLException e) {
          e.printStackTrace();
        }
      });
      if (row.next()) {
        tabID = row.getLong(1);
      } else {
        throw new Exception("failed to create new tab");
      }
    }

    String request = String.join(" ", //
        "INSERT INTO OrderTable VALUES(", //
        "DEFAULT,", //
        Long.toString(tabID), //
        ",current_timestamp,", //
        "null,", //
        "null,", //
        "null,", //
        "null", //
        ")", //
        "RETURNING order_id;" //
    );
    ResultSet order = db.executeSelect(request, (ps) -> {
    });

    if (!order.next()) {
      throw new Exception("failed to create new order");
    }
    long orderID = order.getLong(1);

    // Table.checkWaiter(res, table);
    @SuppressWarnings("rawtypes")
    Iterator itemsIterator = items.iterator();
    while (itemsIterator.hasNext()) {
      JSONObject x = (JSONObject) itemsIterator.next();
      String mealName = (String) x.get("name");
      long quantity = (long) x.get("quantity");
      String req = "INSERT INTO OrderItem VALUES (DEFAULT, ?, ?, ?);";
      try {
        db.executeUpdate(req, (PreparedStatement ps) -> {
          try {
            ps.setLong(1, orderID);
            ps.setString(2, mealName);
            ps.setLong(3, quantity);
          } catch (SQLException e) {
            e.printStackTrace();
          }
        });
      } catch (SQLException e) {
        e.printStackTrace();
      }
    }
    updater.statusChange(Long.toString(branchID));
  }

  /**
   * Used to get the list of all orders from a table.
   * 
   * @param location the restaurant the order is in
   * @param table the table concerned
   * @return a list of all orders
   */
  public HashMap<String, Long> list(Integer location, Integer table) {
    // return the list of orders from the table
    return null;
  }

  /**
   * Gets the time of when the order was placed for particular order at specific table.
   * 
   * @param orderId the id of the order
   * @param tabId the id of the table order was placed at
   * @return the order id, table id and time order was placed
   */
  public static String getOrderPlacedTime(long orderId, long tabId) throws SQLException {
    String request = String.join(" ", //
        "SELECT COALESCE(json_agg(ordertable.time_requested),'[]')", //
        "FROM ordertable", //
        "WHERE ordertable.order_id =", //
        Long.toString(orderId), //
        "AND ordertable.tab_id =", //
        Long.toString(tabId) //
    );

    ResultSet data = db.executeSelect(request);
    data.next();
    return data.getString(1);
  }



}
