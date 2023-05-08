package uk.ac.rhul.teamproject202121;

import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.sql.SQLException;
import org.json.simple.parser.JSONParser;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MenuTest {
  JSONParser parse = null;



  @SuppressWarnings("static-access")
  @BeforeAll
  static void beforeAll() throws IOException {
    try {
      Database.getDatabase().init();
    } catch (SQLException e) {
      System.out.println(e.getMessage());
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }


  @BeforeEach
  void before() {
    parse = new JSONParser();
  }

  @Test
  void testGetMenu() throws SQLException, IOException {
    assertTrue("the menu result must match the menu schema",
        SchmaValidate.validate(Menu.getMenu(), SchmaValidate.menu));
  }

  @Test
  void testGetMenuSchema() throws SQLException, IOException {
    assertTrue("a correct request should be valid",
        SchmaValidate.validate("{\"request\":\"getMenu\"}", SchmaValidate.getMenu));
  }

  @Test
  void testSpecificGetMenu() throws SQLException, IOException {
    assertTrue("the menu result must match the menu schema",
        SchmaValidate.validate(Menu.getMenu(1), SchmaValidate.menu));
  }

  @Test
  void testFilterTypes() throws SQLException, IOException {
    assertTrue("the filter types should satisfy the filter type schema",
        SchmaValidate.validate(Menu.getFilterTypes(), SchmaValidate.filterType));
  }
}
