package uk.ac.rhul.teamproject202121;

import java.sql.ResultSet;
import java.sql.SQLException;
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
 * Class for managing payments.
 * 
 * @author team21
 */
@RestController
@RequestMapping("/api")
public class Payment {
  private static final Database db = Database.getDatabase();
  JSONParser parser = new JSONParser();
  
  @Autowired
  Update updater;

  /**
   * sets a table to being paid.
   * 
   * @param body the json encoded table number and branch id
   * @return ResponseEntity response to let the waiter know this has succeeded
   */
  @PostMapping("/setpaid")
  public ResponseEntity<String> setPaid(@RequestBody String body) {
    try {
      JSONObject tablestatus = (JSONObject) parser.parse(body);
      if (tablestatus.containsKey("branchID") && tablestatus.containsKey("tableNumber")) {
        long tableNumber = (long) tablestatus.get("tableNumber");
        long branchID = (long) tablestatus.get("branchID");
        String request = String.join("\n", //
            "UPDATE tab", //
            "SET is_paid = true", //
            "WHERE branch_id=?", //
            "AND table_number=?" //
        );
        try {
          db.executeUpdate(request, ps -> {
            try {
              ps.setLong(1, branchID);
              ps.setLong(2, tableNumber);
            } catch (SQLException e) {
              e.printStackTrace();
            }
          });
        } catch (SQLException e) {
          System.err.println(e.getMessage());
          e.printStackTrace();
          return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        updater.statusChange(Long.toString(branchID));
      } else {
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
      }
    } catch (Exception e) {
      e.printStackTrace();
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
    
    return new ResponseEntity<>("ok", HttpStatus.OK);

  }


  /**
   * Endpoint for getting all the items that a user has ordered.
   * 
   * @param body the json encoded table number and branch id
   * @return ResponseEntity the list of items the customer has bought.
   */
  @PostMapping("/getordereditems")
  public ResponseEntity<String> getCost(@RequestBody String body) {
    String request = String.join("\n", //
        "SELECT json_agg(meal) FROM (", //
        "SELECT json_build_object(", //
        "  'name',orderitem.name,", //
        "  'quantity',sum(orderitem.quantity),", //
        "  'price',coalesce(new_price,price)) as meal", //
        "FROM tab", //
        "JOIN ordertable", //
        "ON tab.tab_id = ordertable.tab_id ", //
        "JOIN orderitem", //
        "ON orderitem.order_id = ordertable.order_id", //
        "JOIN isinstock", //
        "ON isinstock.meal_name = orderitem.name", //
        "JOIN menu", //
        "ON menu.name = orderitem.name", //
        "WHERE tab.branch_id= ?", //
        "AND tab.table_number= ?", //
        "AND NOT tab.is_paid", //
        "AND isinstock.branch_id = tab.branch_id", //
        "GROUP BY orderitem.name,price,new_price) as info"); //
    try {
      JSONObject tablestatus = (JSONObject) parser.parse(body);
      if (tablestatus.containsKey("branchID") && tablestatus.containsKey("tableNumber")) {
        long tableNumber = (long) tablestatus.get("tableNumber");
        long branchID = (long) tablestatus.get("branchID");
        try {
          ResultSet data = db.executeSelect(request, ps -> {
            try {
              ps.setLong(1, branchID);
              ps.setLong(2, tableNumber);
            } catch (SQLException e) {
              e.printStackTrace();
            }
          });
          if (data.next()) {
            String output = data.getString(1);
            if (output == null || output.isEmpty()) {
              return new ResponseEntity<>("[]", HttpStatus.OK);
            }
            return new ResponseEntity<>(output, HttpStatus.OK);
          }
          return new ResponseEntity<>("[]", HttpStatus.OK);
        } catch (SQLException e) {
          System.err.println(e.getMessage());
          e.printStackTrace();
          return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

      } else {
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
      }
    } catch (Exception e) {
      e.printStackTrace();
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }



  }
}
