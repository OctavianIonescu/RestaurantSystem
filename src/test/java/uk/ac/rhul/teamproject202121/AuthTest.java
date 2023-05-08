package uk.ac.rhul.teamproject202121;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.sql.SQLException;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;


public class AuthTest {
  @SuppressWarnings("static-access")
  @BeforeAll
  static void beforeAll() throws SQLException, IOException {
    Database.getDatabase().init();
  }

  @Test
  public void testAuthDetailsSchema() {
    String empty = "{}";
    assertFalse("the details schema should require content",
        SchmaValidate.validate(empty, SchmaValidate.authDetails));

    String correct = "{\"username\":\"hello\",\"password\":\"bye\"}";
    assertTrue("the details schema should validate a correct request",
        SchmaValidate.validate(correct, SchmaValidate.authDetails));

    String extra = "{\"username\":\"hello\",\"password\":\"bye\", \"more\":\"sql data\"}";
    assertFalse("the details schema should stop extra data",
        SchmaValidate.validate(extra, SchmaValidate.authDetails));

    String wrongType = "{\"username\":2,\"password\":false}";
    assertFalse("the details schema should ensure the correct type of data",
        SchmaValidate.validate(wrongType, SchmaValidate.authDetails));
  }

  @Test
  public void testAuthResponseSchema() {
    assertTrue("message schemas should be accepted",
        SchmaValidate.validate("{\"message\":\"there was an error\"}", SchmaValidate.authResponse));

    assertTrue("message schemas should be accepted",
        SchmaValidate.validate(
            "{\"firstName\":\"name\",\"lastName\":\"name\",\"isManager\":true,"
                + "\"location\":{\"key\":100,\"description\":\"hi\"}}",
            SchmaValidate.authResponse));
  }

  @Test
  public void testAuthResponseScheama() throws ParseException {
    String correct = "{\"username\":\"waiter_1\",\"password\":\"password_1\"}";
    String wrong = "{\"username\":\"hello\",\"password\":\"bye\"}";

    assertTrue("The response should be of the correct type",
        SchmaValidate.validate(Auth.authUser(wrong), SchmaValidate.authResponse));
    assertTrue("The response should be of the correct type",
        SchmaValidate.validate(Auth.authUser(correct), SchmaValidate.authResponse));

  }

  @Test
  public void testAuthResponse() throws ParseException {
    String correct = "{\"username\":\"waiter_1\",\"password\":\"password_1\"}";
    String wrong = "{\"username\":\"hello\",\"password\":\"bye\"}";
    assertFalse("a valid user should not throw an error ->" + Auth.authUser(correct),
        isErrorMessage(Auth.authUser(correct)));
    assertTrue("a invalid user should return an error ->"
        + Auth.authUser(correct), isErrorMessage(Auth.authUser(wrong)));

  }

  boolean isErrorMessage(String res) throws ParseException {
    JSONParser p = new JSONParser();
    JSONObject o = (JSONObject) p.parse(res);
    return o.containsKey("message");
  }
}
