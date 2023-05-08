package uk.ac.rhul.teamproject202121;

import java.sql.SQLException;
import java.util.HashMap;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Singleton class for managing the status of orders.
 * 
 * @author Team21
 */
@RestController
@RequestMapping("/api")
public class OrderStatus {
  private static final Database db = Database.getDatabase();
  HashMap<String, String> attrStatusMap = null;

  OrderStatus() {
    attrStatusMap = new HashMap<String, String>();
    attrStatusMap.put("order_requested", "time_requested");
    attrStatusMap.put("meal_ready_for_delivery", "time_ready");
    attrStatusMap.put("meal_delivered", "time_delivered");
    attrStatusMap.put("meal_confirmed", "time_checked_on");
    attrStatusMap.put("table_clear", "time_cleared");
  }

  JSONParser parser = new JSONParser();

  private static HashMap<String, String> orders = new HashMap<String, String>();

  /**
   * Adds a new order to the list. This order is as yet unconfirmed by the waiter.
   * 
   * @param order the order id
   * @param status the status you wish to set the order to
   */
  public static void changeOrderStatus(String order, String status) {
    orders.put(order, status);
  }

  /**
   * Method to check the status of an order.
   * 
   * @param order the order to be checked on
   * @return the status of the order
   */
  public static String getStatus(String order) {
    return orders.get(order);
  }

  @Autowired
  Update updater;

  /**
   * API end point for updating the status of an order at table.
   * 
   * @param body A JSON encoded string with the table number and state of table
   * @return the response(either a bad request or OK on success)
   */
  @PostMapping("/updatestatus")
  public ResponseEntity<String> location(@RequestBody String body) {
    try {
      JSONObject tablestatus = (JSONObject) parser.parse(body);
      if (tablestatus.containsKey("number") && tablestatus.containsKey("state")
          && tablestatus.containsKey("branchID")) {
        long tableNumber = (long) tablestatus.get("number");
        String status = (String) tablestatus.get("state");
        long branchID = (long) tablestatus.get("branchID");
        updateStatus(branchID, tableNumber, status);
        updater.statusChange(Long.toString(branchID));
      } else {
        System.out.println("wrong key");
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
      }
    } catch (Exception e) {
      e.printStackTrace();
      System.out.println("wrong key");
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    return new ResponseEntity<>("ok", HttpStatus.OK);
  }


  /**
   * updates status of an order at a table depending on the order status that it is at.
   * 
   * @param branchId the brach of the table.
   * @param tableNumber table number of a table in restaurant branch
   * @param status the state of the table depending on the order status on that table.
   * @throws SQLException if there is an error connecting to the database.
   */
  public void updateStatus(long branchId, long tableNumber, String status)
      throws SQLException, Exception {
    Long tabID = OrderService.getTabID(branchId, tableNumber);
    String attr = attrStatusMap.get(status);
    if (attr == null) {
      throw new Exception("failed to update time status changed");
    }
    if (tabID == null) {
      throw new Exception("could not find a tab for this table");
    }
    String request = String.join("\n", //
        "UPDATE OrderTable", //
        "SET", //
        attr, //
        " = current_timestamp", //
        "WHERE tab_id = ?" //
    );
    db.executeUpdate(request, ps -> {
      try {
        ps.setLong(1, tabID);
      } catch (SQLException e) {
        e.printStackTrace();
      }
    });
  }

}

