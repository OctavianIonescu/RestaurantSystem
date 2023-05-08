package uk.ac.rhul.teamproject202121;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

/**
 * class for management of access of restaurant locations.
 * 
 * @author Team21
 *
 */
public class Restaurants {

  /**
   * Used to insert branch id and name into a restaurants JSON file.
   * 
   * @param db database where information about restaurant branch is stored
   * @return a JSON array object containing details of restaurant branches
   */
  @SuppressWarnings("unchecked")
  public static JSONArray getRestaurants(Database db) {
    JSONArray restaurants = new JSONArray();
    JSONObject branch;
    try {
      ResultSet branches = db.executeSelect("SELECT BranchID, branch name FROM Branch");
      while (branches.next()) {
        // creates a JSON branch object for every branch entity returned by SQL query
        branch = new JSONObject();
        branch.put("BranchID", branches.getString(1));
        branch.put("branch name", branches.getString(2));
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return restaurants;
  }
}
