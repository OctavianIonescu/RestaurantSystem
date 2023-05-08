package uk.ac.rhul.teamproject202121;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import org.json.simple.parser.ParseException;
import org.junit.jupiter.api.Test;

public class FilterTest {
  
  @Test
  public void testGetMeals() throws IOException, ParseException {
    Filter filter = new Filter();
    
    assertEquals(filter.listdata.size(), 0);
  }

}
