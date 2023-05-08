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
 * Class for interacting with the Kitchen view. getting and setting the data it needs.
 * 
 * @author Team21
 */
@RestController
@RequestMapping("/api")
public class KitchenOrders {
  Database db = Database.getDatabase();
  JSONParser parser = new JSONParser();

  /**
   * This end point will return the tables assigned to a waiter.
   * 
   * @param branchID the waiters details.
   * @return the tables a waiter is assigned to.
   */
  @PostMapping("/kitchenorders")
  public ResponseEntity<String> kitchenorders(@RequestBody String branchID) {
    try {
      return new ResponseEntity<>(getKitchenOrders(Long.parseLong(branchID)), HttpStatus.OK);
    } catch (NumberFormatException e) {
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    } catch (Exception e) {
      System.out.println(e.getMessage());
      e.printStackTrace();
      return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Autowired
  Update updater;

  /**
   * This end point will set an order as done.
   * 
   * @param body the orderid and branch id
   * @return the tables a waiter is assigned to.
   */
  @PostMapping("/kitchendone")
  public ResponseEntity<String> kitchendone(@RequestBody String body) {
    try {
      JSONObject data = (JSONObject) parser.parse(body);
      if (data.containsKey("orderID") && data.containsKey("branchID")) {
        long orderID = (long) data.get("orderID");
        long branchID = (long) data.get("branchID");
        String request = String.join("\n", "UPDATE ordertable", //
            "SET time_ready = current_timestamp", //
            "WHERE order_id = ?" //
        );
        db.executeUpdate(request, ps -> {
          try {
            ps.setLong(1, orderID);
          } catch (SQLException e) {
            e.printStackTrace();
          }
        });
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
   * Gets the orders that the kitchen needs to make.
   * 
   * @param branchID the brach the kitchen is at.
   * @return String json encoded object with all the data the kitchen will need
   * @throws Exception if there is a problem getting the data
   */
  public String getKitchenOrders(long branchID) throws Exception {
    String request = String.join("\n", //
        "SELECT coalesce(json_agg(orders),'[]')", //
        "FROM (", //
        "SELECT ordertable.order_id as \"orderID\", ", //
        "  time_requested as \"orderTime\",", //
        "  ordertable.time_ready is null as doing,", //
        "  json_agg(json_build_object(", //
        "  'name',meal.name,", //
        "  'quantity',quantity,", //
        "  'ingredients',\"ingredients\",", //
        "  'img',\"img\",", //
        "  'description',description)) as items", //
        "FROM ordertable", //
        "INNER JOIN tab", //
        "ON tab.branch_id=?", //
        "AND NOT tab.is_paid", //
        "AND tab.tab_id = ordertable.tab_id", //
        "INNER JOIN orderitem", //
        "ON orderitem.order_id = ordertable.order_id", //
        "INNER JOIN (", //
        "  SELECT name, ingredients.data as \"ingredients\"", //
        ", picture as img, description", //
        "FROM Menu, (SELECT json_agg(json_build_object(", //
        "  'name',name,", //
        "  'isAllergen', is_allergen,", //
        "  'percentage',amount_in_grams*100/total", //
        "  )) as data, comb.meal as meal", //
        "from (", //
        "   SELECT name,is_allergen,amount_in_grams,Meal_Ingredient.meal as meal", //
        "   FROM Ingredient,Meal_Ingredient", //
        "   WHERE Ingredient.name = Meal_Ingredient.Ingredient", //
        "   ORDER BY meal,amount_in_grams DESC", //
        ") as comb,(", //
        "   SELECT meal,sum(amount_in_grams) as total", //
        "   FROM Meal_Ingredient GROUP BY meal) as total", //
        "WHERE comb.meal = total.meal", //
        "GROUP BY comb.meal) as ingredients ", //
        "WHERE ingredients.meal = Menu.meal", //
        "ORDER BY name ", //
        ") as meal", //
        "ON meal.name = orderitem.name", //
        "WHERE ordertable.time_delivered is null", //
        "AND ordertable.time_checked_on is null", //
        "AND ordertable.time_cleared is null", //
        "GROUP BY ordertable.order_id", //
        "ORDER BY time_requested ASC", //
        ") as orders" //
    );
    ResultSet data = db.executeSelect(request, ps -> {
      try {
        ps.setLong(1, branchID);
      } catch (SQLException e) {
        e.printStackTrace();
      }
    });
    if (data.next()) {
      return data.getString(1);
    }
    throw new Exception("there should be some data");
  }
}
