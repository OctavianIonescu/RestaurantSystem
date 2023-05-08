package uk.ac.rhul.teamproject202121;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.function.Function;
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
 * Class for management of access and control of the menu.
 * 
 * @author Team21
 */
@RestController
@RequestMapping("/api")
public class Menu {
  /**
   * Used to obtain the menu from the database.
   * 
   * @param body the request body from the client.
   * @return the menu data for the client.
   */
  @PostMapping("/menu")
  public ResponseEntity<String> menu(@RequestBody String body) {
    JSONParser parser = new JSONParser();
    try {
      JSONObject req = (JSONObject) parser.parse(body);
      switch ((String) req.get("request")) {
        case "getMenu":
          try {
            return new ResponseEntity<>(Menu.getMenu(), HttpStatus.OK);
          } catch (SQLException e) {
            e.printStackTrace();
            return new ResponseEntity<String>("error while getting data",
                HttpStatus.INTERNAL_SERVER_ERROR);
          }
        case "getSpecificMenu":
          try {
            if (req.get("branchID") == null) {
              return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(Menu.getMenu((long) req.get("branchID")), HttpStatus.OK);
          } catch (SQLException e) {
            System.out.println(e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<String>("error while getting data",
                HttpStatus.INTERNAL_SERVER_ERROR);
          }
        case "getFilterTypes":
          try {
            return new ResponseEntity<>(Menu.getFilterTypes(), HttpStatus.OK);
          } catch (SQLException e) {
            e.printStackTrace();
            return new ResponseEntity<String>("Error while getting data",
                HttpStatus.INTERNAL_SERVER_ERROR);
          }
        case "getEditMenu":
          try {
            if (req.get("branchID") == null) {
              return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(Menu.getEditMenu((long) req.get("branchID")),
                HttpStatus.OK);
          } catch (SQLException e) {
            System.out.println(e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<String>("error while getting data",
                HttpStatus.INTERNAL_SERVER_ERROR);
          }
        case "setMealPrice":
          try {
            if (req.get("branchID") == null || req.get("name") == null
                || req.get("price") == null) {
              return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            long branchID = (long) req.get("branchID");
            String name = (String) req.get("name");
            long price = (long) req.get("price");
            this.setBranchPrice(branchID, name, price);
            return new ResponseEntity<>(HttpStatus.OK);
          } catch (SQLException e) {
            System.out.println(e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<String>("error while getting data",
                HttpStatus.INTERNAL_SERVER_ERROR);
          }
        default:
          return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
      }
    } catch (Exception e) {
      // could be parse exception or conversion exception
      e.printStackTrace();
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
  }

  private static final Database db = Database.getDatabase();
  private static final String getIngredients = String.join("\n", //
      "SELECT json_agg(json_build_object('name',name,'isAllergen', is_allergen,", //
      "'percentage',amount_in_grams*100/total)) as data, comb.meal as meal,", //
      "json_agg(DISTINCT \"type\") as types", //
      "from (", //
      "   SELECT name,is_allergen,amount_in_grams,\"type\",Meal_Ingredient.meal as meal", //
      "   FROM Ingredient,Meal_Ingredient", //
      "   WHERE Ingredient.name = Meal_Ingredient.Ingredient", //
      "   ORDER BY meal,amount_in_grams DESC", //
      ") as comb,(", //
      "   SELECT meal,sum(amount_in_grams) as total ", //
      "   FROM Meal_Ingredient GROUP BY meal) as total", //
      "WHERE comb.meal = total.meal", //
      "GROUP BY comb.meal");
  private static final Function<String, String> category = (String getItem) -> {
    return String.join("\n", //
        "SELECT category_name as \"categoryName\"", //
        ", json_agg(row_to_json(item)) as items", //
        " from (" + getItem + ") as item, Category", //
        "WHERE item.category_id = Category.category_id", //
        "GROUP BY Category.category_id", //
        "ORDER BY Category.category_id ASC");
  };

  /**
   * Used to get the full menu from the database.
   *
   * @return A JSON array object containing the menu details
   * @throws SQLException There is an error with retrieving the data from the database
   */
  public static String getMenu() throws SQLException {
    String getItem = String.join("\n", //
        "SELECT name, price, ingredients.data as \"ingredients\" ", //
        ", picture as img, description, category_id,", //
        "ingredients.types as \"types\"", //
        "FROM Menu, (" + getIngredients + ") as ingredients", //
        "WHERE ingredients.meal = Menu.meal", //
        "ORDER BY name");


    String request = "SELECT json_agg(cat) as menu from (" + category.apply(getItem) + ") as cat";
    ResultSet data = db.executeSelect(request);
    data.next();
    return data.getString(1);
  }

  /**
   * Used to get a reduced menu for a specific restaurant.
   *
   * @param branchId the branch the menu is for.
   * @return A JSON array object containing the menu details
   * @throws SQLException There is an error with retrieving the data from the database
   */
  public static String getMenu(long branchId) throws SQLException {

    String getItem = String.join("\n", //
        "SELECT name, COALESCE(new_price,price)  as price,", //
        "ingredients.data as \"ingredients\",", //
        "picture as img, description, category_id,", //
        "ingredients.types as \"types\"", //
        "FROM Menu, (" + getIngredients + ") as ingredients,IsInStock", //
        "WHERE ingredients.meal = Menu.meal and IsInStock.meal_name = Menu.name", //
        "and IsInStock.branch_id = ? and is_in_stock", //
        "ORDER BY name");

    String request = "SELECT json_agg(cat) as menu from (" + category.apply(getItem) + ") as cat";
    ResultSet data = db.executeSelect(request, ps -> {
      try {
        ps.setLong(1, branchId);
      } catch (SQLException e) {
        e.printStackTrace();
      }
    });
    data.next();
    return data.getString(1);
  }

  /**
   * Gets the types of data that can be filtered by.
   * 
   * @return JSON array of filter types that is an object with a key and a name(description)
   * @throws SQLException There is an error with retrieving the data from the database
   */
  public static String getFilterTypes() throws SQLException {
    String request = String.join("\n", //
        "SELECT json_agg(json_build_object('key',type_id,'description',name)) ", //
        "FROM  ingredient_type");
    ResultSet data = db.executeSelect(request);
    data.next();
    return data.getString(1);
  }


  /**
   * Get the full menu But with the deleted items markred as such.
   * 
   * @param branchId the branch the manager wants to edit from.
   * @return A JSON array object containing the menu details
   * @throws SQLException There is an error with retrieving the data from the database
   */
  public static String getEditMenu(long branchId) throws SQLException {
    String getItem = String.join("\n", //
        "SELECT name, COALESCE(new_price,price) as price,  ingredients.data as \"ingredients\" ", //
        ", picture as img, description, category_id,", //
        "ingredients.types as \"types\",", //
        "is_in_stock as \"inStock\"", //
        "FROM Menu, (" + getIngredients + ") as ingredients,IsInStock", //
        "WHERE ingredients.meal = Menu.meal and IsInStock.meal_name = Menu.name", //
        "and IsInStock.branch_id = ?", //
        "ORDER BY name");

    String request = "SELECT json_agg(cat) as menu from (" + category.apply(getItem) + ") as cat";
    ResultSet data = db.executeSelect(request, ps -> {
      try {
        ps.setLong(1, branchId);
      } catch (SQLException e) {
        e.printStackTrace();
      }
    });
    data.next();
    return data.getString(1);
  }

  @Autowired
  Update updater;

  /**
   * Sets the price for a given meal at a particular branch.
   * 
   * @param branchId the branch that's menu is being updated
   * @param name the name of the meal to update
   * @param price the new price of the meal.
   * @throws Exception if there is an error in cheging the price.
   */
  public void setBranchPrice(long branchId, String name, long price) throws Exception {
    String check = String.join("\n", //
        "SELECT *", //
        "FROM IsInStock", //
        "WHERE meal_name=?", //
        "AND branch_id=?;" //
    );
    ResultSet count = db.executeSelect(check, (PreparedStatement ps) -> {
      try {
        ps.setString(1, name);
        ps.setLong(2, branchId);
      } catch (SQLException e) {
        e.printStackTrace();
      }
    });
    if (!count.next()) {
      throw new Exception("no meals that match this request");
    }
    String request = String.join("\n", //
        "UPDATE IsInStock", //
        "SET new_price = ?", //
        "WHERE meal_name=?", //
        "AND branch_id=?;" //
    );
    db.executeUpdate(request, (PreparedStatement ps) -> {
      try {
        ps.setLong(1, price);
        ps.setString(2, name);
        ps.setLong(3, branchId);
      } catch (SQLException e) {
        e.printStackTrace();
      }
    });
    updater.menuChange(branchId);
  }
  
}

