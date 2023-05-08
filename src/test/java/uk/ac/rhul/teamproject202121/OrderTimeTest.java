package uk.ac.rhul.teamproject202121;

import static org.junit.Assert.assertTrue;
import java.io.IOException;
import java.sql.SQLException;
import org.json.simple.parser.JSONParser;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class OrderTimeTest {
  
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
  void testOrderTimes() throws SQLException {
    assertTrue("the order time result must match the order_times schema",
        SchmaValidate.validate(OrderService.getOrderPlacedTime(134537,141), SchmaValidate.orderTimes));
    assertTrue("the order time must return different times according to order id and tab id given",
        SchmaValidate.validate(OrderService.getOrderPlacedTime(964037,345), SchmaValidate.orderTimes));
  }
  
}
