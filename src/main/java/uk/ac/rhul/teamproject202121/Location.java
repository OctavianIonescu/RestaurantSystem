package uk.ac.rhul.teamproject202121;

import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * A class for getting data about branch locations. This class allows you to request the tables that
 * are free at a branch or even all the possible branches. All results are returned as a JSON
 * formatted string unless stated otherwise.
 *
 * @author Team21
 *
 */
public class Location {
  private static final Database db = Database.getDatabase();

  /**
   * Creates an array of the names and id's of all branch locations.
   * 
   * @return JSON encoded string of all locations
   * @throws SQLException if the class cannot retrieve the locations
   */
  public static String getAllLocations() throws SQLException {
    String request = String.join(" ", //
        "SELECT json_agg(json_build_object('key',branch_id,'description',branch_name))", //
        "From branch");
    ResultSet data = db.executeSelect(request);
    data.next();
    return data.getString(1);
  }


  /**
   * Creates an array of tables available from a location.
   * 
   * @param branchId the branch to get the locations from.
   * @return JSON encoded string of table numbers
   * @throws SQLException if the class cannot retrieve the locations
   */
  public static String getTables(long branchId) throws SQLException {
    String dirtyTables = String.join(" ", //
        "SELECT tables.table_number, bool_and(NOT ordertable.time_cleared is null) as not_clear", //
        "FROM tables,tab,ordertable", //
        "WHERE tab.branch_id = tables.branch_id ", //
        "AND tab.table_number = tables.table_number ", //
        "AND ordertable.tab_id = tab.tab_id", //
        "AND tables.branch_id =", //
        Long.toString(branchId), "GROUP BY tables.branch_id, tables.table_number" //
    );
    String request = String.join(" ", //
        "SELECT json_agg(tables.table_number)", //
        "FROM tables", //
        "LEFT JOIN (", //
        dirtyTables, //
        ") AS dirty", //
        "ON tables.table_number = dirty.table_number", //
        "WHERE (dirty.not_clear is NULL or dirty.not_clear)", //
        "AND tables.branch_id =", //
        Long.toString(branchId));

    ResultSet data = db.executeSelect(request);
    data.next();
    return data.getString(1);
  }

  /**
   * Creates an array of tables and their status for a location.
   * 
   * @param branchId the branch to get the locations from.
   * @return JSON encoded string of table numbers
   * @throws SQLException if the class cannot retrieve the locations
   */
  public static String getTableStatus(long branchId) throws SQLException {
    String request = String.join("\n", //
        "SELECT json_agg(\"data\") FROM(", //
        "SELECT tables.table_number as \"number\", json_agg(", //
        "  CASE ", //
        "    WHEN NOT time_cleared    is null THEN ", //
        "      json_build_object('name','table_clear','order',5)", //
        "    WHEN NOT time_checked_on is null THEN", //
        "      json_build_object('name','meal_confirmed','order',4)", //
        "    WHEN NOT time_delivered  is null THEN", //
        "      json_build_object('name','meal_delivered','order',3)", //
        "    WHEN NOT time_ready      is null THEN", //
        "      json_build_object('name','meal_ready_for_delivery','order',2)", //
        "    WHEN NOT time_requested  is null THEN", //
        "      json_build_object('name','order_requested','order',1)", //
        "    ELSE json_build_object('name','table_empty','order',6)", //
        "  END) as \"state\", ", //
        "  username as staff_username,", //
        "  first_name as staff_firstname,", //
        "  surname as staff_lastname", //
        "FROM tables", //
        "LEFT JOIN tab  ", //
        "ON tab.branch_id = tables.branch_id  ", //
        "AND tab.table_number = tables.table_number", //
        "AND NOT tab.is_paid", //
        "LEFT JOIN ordertable", //
        "ON ordertable.tab_id = tab.tab_id ", //
        "LEFT JOIN staff", //
        "ON staff.staff_id = tab.host", //
        "WHERE tables.branch_id =?", //
        "GROUP BY \"number\",username,first_name,surname) as \"data\"" //
    );
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
}
