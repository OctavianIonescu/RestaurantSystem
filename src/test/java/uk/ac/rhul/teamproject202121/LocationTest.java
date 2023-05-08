package uk.ac.rhul.teamproject202121;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.io.IOException;
import java.sql.SQLException;
import java.util.HashSet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class LocationTest {
  JSONParser parse = null;



  @SuppressWarnings("static-access")
  @BeforeAll
  static void beforeAll() throws SQLException, IOException {
    Database.getDatabase().init();
  }


  @BeforeEach
  void before() {
    parse = new JSONParser();
  }

  @Test
  void testGetAllLocations() throws SQLException, IOException {
    JSONArray res = null;
    try {
      res = (JSONArray) parse.parse(Location.getAllLocations());
    } catch (ParseException e) {
      fail("incorrectly formatted result");
    } catch (SQLException e) {
      fail("incorrectly unable to make request");
    } catch (Exception e) {
      fail("(probably) incorrect type of data");
    }
    HashSet<Long> keys = new HashSet<Long>();
    try {
      for (Object o : res) {
        JSONObject cur = (JSONObject) o;
        long key = (long) cur.get("key");
        if (keys.contains(key)) {
          fail("keys must be unique");
        }
        keys.add(key);
        String desc = (String) cur.get("description");
        if (desc == null || desc.isBlank()) {
          fail("empty data");
        }
      }
    } catch (Exception e) {
      fail("(probably) incorrect type of data");
    }
  }

  @Test
  void testGetTables() throws SQLException {
    assertTrue("the tables result must match the menu schema",
        SchmaValidate.validate(Location.getTables(1), SchmaValidate.tables));
    assertTrue("the tables must return for different locations",
        SchmaValidate.validate(Location.getTables(2), SchmaValidate.tables));
  }
}
