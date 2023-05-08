package uk.ac.rhul.teamproject202121;

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
 * Class for changing whether a given item is in stock.
 * 
 * @author team21
 */
@RestController
@RequestMapping("/api")
public class Stock {
  private static final Database db = Database.getDatabase();
  JSONParser parser = new JSONParser();


  /**
   * End point for the edit menu to change the weather an item is in stock. For now it doesn't
   * authenticate these actions, but in the future it will.
   * 
   * @param body A JSON encoded string with the mealID branchID and inStock
   * @return the response(either a bad request or OK on success)
   */
  @PostMapping("/setStock")
  public ResponseEntity<String> menu(@RequestBody String body) {
    try {
      JSONObject details = (JSONObject) parser.parse(body);
      if (details.containsKey("mealName") && details.containsKey("branchID")
          && details.containsKey("inStock")) {
        String meal = (String) details.get("mealName");
        long branch = (long) details.get("branchID");
        boolean stock = (boolean) details.get("inStock");
        setInStock(meal, branch, stock);
      } else {
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
      }
    } catch (Exception e) {
      e.printStackTrace();
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    return new ResponseEntity<>("ok", HttpStatus.OK);
  }

  @Autowired
  Update updater;

  /**
   * Sets whether a meal is in stock at a particular branch.
   * 
   * @param mealName the name of the meal to update the stock for.
   * @param branchId the branch to edit for
   * @param inStock boolean if yes then this item will be available for purchase
   * @throws SQLException if there is an error connecting to the database.
   */
  public void setInStock(String mealName, long branchId, boolean inStock)
      throws SQLException {
    String request = String.join("\n", //
        "UPDATE IsInStock", //
        "SET is_in_stock = ?", 
        "WHERE branch_id = ?", //
        "AND meal_name = ?" //
    );
    db.executeUpdate(request, ps -> {
      try {
        ps.setBoolean(1, inStock);
        ps.setLong(2, branchId);
        ps.setString(3, mealName);
      } catch (SQLException e) {
        e.printStackTrace();
      }
    });
    updater.menuChange(branchId);
  }
}
