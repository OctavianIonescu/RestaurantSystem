package uk.ac.rhul.teamproject202121;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import java.util.ArrayList;
import org.junit.jupiter.api.Test;

class TableTest {

  /**
   * Adds a waiter to the array.
   */
  @Test
  void testAddWaiter() {
    String waiterid = "waiter_1";
    Integer branchid = 5;
    assertDoesNotThrow(() -> Table.addWaiter(waiterid, branchid),
        "No errors should be thrown adding a waiter");
  }

  @Test
  void testGetWaiter() {
    String waiterid = "waiter_2";
    Integer branchId = 5;
    Table.addWaiter(waiterid, branchId);
    ArrayList<String> al = new ArrayList<String>();
    al.add("waiter_2");
    al.add("waiter_1");
    assertEquals(Table.getWaiters(branchId), al, 
        "Since the object is static the additions from the last test should carry over.");
  }

}
