package uk.ac.rhul.teamproject202121;

import java.io.IOException;
import java.io.InputStream;
import org.everit.json.schema.Schema;
import org.everit.json.schema.ValidationException;
import org.everit.json.schema.loader.SchemaLoader;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;

/**
 * Validates a JSON string against a given schema.
 * 
 * @author team21
 *
 */
public class SchmaValidate {
  public static final String menu = "menu";
  public static final String filterType = "filter_type";
  public static final String tables = "tables";
  public static final String authDetails = "auth_details";
  public static final String authResponse = "auth_response";
  public static final String getMenu = "get_menu";
  public static final String orderTimes = "order_times";

  /**
   * Checks whether a given string is a valid JSON for a given schema. The schema is a schema file
   * in JSON_SCHEMA/file_name.json
   * 
   * @param json the string to test.
   * @param schemaName the filename of the schema to check against
   * @return true if the string is valid.
   */
  public static boolean validate(String json, String schemaName) {
    if (json == null) {
      throw new Error("json is null");
    }
    if (schemaName == null) {
      throw new Error("schema is null");
    }
    try (InputStream inputStream =
        SchmaValidate.class.getResourceAsStream("/JSON_SCHEMA/" + schemaName + ".json")) {
      JSONObject rawSchema = new JSONObject(new JSONTokener(inputStream));
      Schema schema = SchemaLoader.load(rawSchema);
      Object data;
      if (json.startsWith("[")) {
        data = new JSONArray(json);
      } else {
        data = new JSONObject(json);
      }
      schema.validate(data);
      return true;
    } catch (IOException e) {
      return false;
    } catch (ValidationException e) {
      e.getAllMessages().forEach(s -> System.out.println(s));
      System.out.println(e.getErrorMessage());
      System.out.println(e.getMessage());
      return false;
    }
  }
}
