package uk.ac.rhul.teamproject202121;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.boot.json.JsonParseException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * This is a class for authenticating a user.
 * 
 * @author team21
 */
@RestController
@RequestMapping("/api")
public class Auth {
  private static final Database db = Database.getDatabase();


  /**
   * Get a users Details if they have the valid credentials. this process can also be used to
   * validate whether some credentials are correct.
   * 
   * @param body the AuthDetais json object
   * @return the user's details or an error message.
   */
  @PostMapping("/auth")
  public ResponseEntity<String> auth(@RequestBody String body) {
    return new ResponseEntity<>(Auth.authUser(body), HttpStatus.OK);
  }

  /**
   * checks whether the login details are valid and will return the relevant data or error message.
   * 
   * @param details the login details(username and password) in a json encoded string
   * @return a json encoded string of the error details or the valid information.
   */
  public static String authUser(String details) {
    String request = String.join("\n", //
        "UPDATE staff", //
        "SET loggedIn = true", //
        "FROM branch", //
        "WHERE username = ?", //
        "AND password = crypt(?, password)", //
        "AND staff.branch = branch.branch_id", //
        "RETURNING json_build_object(", //
        " 'username',username,", //
        " 'firstName',first_name,", //
        " 'lastName',surname,", //
        " 'isManager',is_manager,", //
        " 'location',json_build_object('key',branch_id,'description',branch_name)", //
        ") " //
    );
    if (!SchmaValidate.validate(details, SchmaValidate.authDetails)) {
      throw new JsonParseException();
    }
    JSONParser p = new JSONParser();
    try {
      JSONObject userData = (JSONObject) p.parse(details);
      String user = (String) userData.get("username");
      String pass = (String) userData.get("password");
      ResultSet dbData = db.executeSelect(request, ps -> {
        try {
          ps.setString(1, user);
          ps.setString(2, pass);
        } catch (SQLException e) {
          e.printStackTrace();
        }
      });
      if (dbData.next()) {
        return dbData.getString(1);
      } else {
        return "{\"message\":\"incorrect username or password\"}";
      }


    } catch (Exception e) {
      System.out.println(e.getMessage());
      e.printStackTrace();
      return "{\"message\":\"invalid request\"}";
    }
  }

  /**
   * check if a particular user is logged in.
   * 
   * @param body the AuthDetais json object
   * @return the user's details or an error message.
   */
  @PostMapping("/checkloggedin")
  public ResponseEntity<String> checkLoggedIn(@RequestBody String body) {
    String request = String.join("\n", //
        "Select loggedIn", //
        "FROM staff", //
        "WHERE username = ?" //
    );
    try {
      ResultSet data = db.executeSelect(request, ps -> {
        try {
          ps.setString(1, body);
        } catch (SQLException e) {
          e.printStackTrace();
        }
      });
      if (data.next()) {
        return new ResponseEntity<>(Boolean.toString(data.getBoolean(1)), HttpStatus.OK);
      }
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    } catch (SQLException e) {
      e.printStackTrace();
      return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  /**
   * Mark a user as logged out so they can no longer be assigned to tables.
   * 
   * @param body the AuthDetais json object
   * @return the user's details or an error message.
   */
  @PostMapping("/logout")
  public ResponseEntity<String> logout(@RequestBody String body) {
    String request = String.join("\n", //
        "UPDATE staff", //
        "SET loggedIn = false", //
        "WHERE username = ?" //
    );
    try {
      db.executeUpdate(request, ps -> {
        try {
          ps.setString(1, body);
        } catch (SQLException e) {
          e.printStackTrace();
        }
      });
      return new ResponseEntity<>("ok", HttpStatus.OK);
    } catch (SQLException e) {
      e.printStackTrace();
      return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }
}
