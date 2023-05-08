package uk.ac.rhul.teamproject202121;

import java.io.IOException;
import java.sql.SQLException;
import java.util.HashMap;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Class for managing connections between the front-end and backend.
 * 
 * @author Team21
 */
@RestController
@RequestMapping("/api")
public class Api {

  /**
   * creates a private orderService object by calling the OrderService class.
   */
  private OrderService orderService;

  /**
   * Constructor for starting the order service for order management.
   * 
   * @param orderService initialises the orderService object
   */
  public Api(OrderService orderService) {
    this.orderService = orderService;
  }

  /**
   * Used to obtain the list of orders from order service.
   * 
   * @return a list of orders that is returned from the list method in the OrderService class
   */
  @GetMapping("/list")
  public HashMap<String, Long> list(@RequestBody String body) {
    JSONParser parser = new JSONParser();
    try {
      JSONObject req = (JSONObject) parser.parse(body);
      Integer restaurant = (int) ((long) req.get("restaurant"));
      Integer table = ((Integer) req.get("table"));
      return orderService.list(restaurant, table);
    } catch (ParseException e) {
      e.printStackTrace();
      return null;
    }
  }


  /**
   * Method to initialise the database structure.
   * 
   * @return confirmation.
   */
  @GetMapping("/init")
  public String init() {
    try {
      Database.init();
    } catch (SQLException | IOException e) {
      e.printStackTrace();
      
      return "failure, database not initialised";
    }
    return "Database initialised";
  }


  /**
   * Used to mark an order as delivered.
   * 
   * @param body the request body from the client
   */
  @PostMapping("/delivered")
  public void markDelivered(@RequestBody String body) {
    JSONParser parser = new JSONParser();
    try {
      JSONObject req = (JSONObject) parser.parse(body);
      Integer restaurant = ((Integer) req.get("restaurant"));
      Integer table = ((Integer) req.get("table"));
      String resTable = "r" + restaurant.toString() + "w" + table.toString();
      OrderStatus.changeOrderStatus(resTable, "delivered");
    } catch (ParseException e) {
      e.printStackTrace();
    }
  }


  /**
   * This end point will return the tables assigned to a waiter.
   * 
   * @param body the waiters details.
   * @return the tables a waiter is assigned to.
   */
  @PostMapping("/tableAssignment")
  public ResponseEntity<String> tableAssignment(@RequestBody String body) {
    JSONParser parser = new JSONParser();
    try {
      JSONObject req = (JSONObject) parser.parse(body);
      switch ((String) req.get("request")) {
        case "getTables":
          String waiter = (String) req.get("waiter");
          return new ResponseEntity<>(Table.getTablesForWaiter(waiter), HttpStatus.OK);
        default:
          return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
      }
    } catch (ParseException e) {
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Uses order service to save an order and all it's associated information to the database.
   * 
   * @param body the request body from the client
   */
  @PostMapping("/submitorder")
  public ResponseEntity<String> add(@RequestBody String body) {
    JSONParser parser = new JSONParser();
    try {
      JSONObject req = (JSONObject) parser.parse(body);
      JSONArray items = ((JSONArray) req.get("items"));
      long branchId = ((long) req.get("restaurant"));
      long tableNumber = ((long) req.get("table"));
      orderService.store(branchId, tableNumber, items);
      return new ResponseEntity<>(HttpStatus.OK);
    } catch (Exception e) {
      e.printStackTrace();
      if (e.getMessage() == "no waiters") {
        return new ResponseEntity<>("no waiters logged in", HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return new ResponseEntity<>("an error has occurred", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  /**
   * Used to obtain restaurants and their tables from the database.
   * 
   * @param body the request body from the client.
   * @return the menu data for the client.
   */
  @PostMapping("/location")
  public ResponseEntity<String> location(@RequestBody String body) {
    JSONParser parser = new JSONParser();
    try {
      JSONObject req = (JSONObject) parser.parse(body);
      switch ((String) req.get("request")) {
        case "getRestaurants":
          try {
            return new ResponseEntity<>(Location.getAllLocations(), HttpStatus.OK);
          } catch (SQLException e) {
            e.printStackTrace();
            return new ResponseEntity<String>("error while getting data",
                HttpStatus.INTERNAL_SERVER_ERROR);
          }
        case "getTables":
          try {
            Integer id = (int) ((long) req.get("branchID"));
            return new ResponseEntity<>(Location.getTables(id), HttpStatus.OK);
          } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<String>("error while getting data",
                HttpStatus.INTERNAL_SERVER_ERROR);
          }
        case "getTableStatus":
          try {
            Integer id = (int) ((long) req.get("branchID"));
            return new ResponseEntity<>(Location.getTableStatus(id), HttpStatus.OK);
          } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<String>("error while getting data",
                HttpStatus.INTERNAL_SERVER_ERROR);
          }
        default:
          return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
      }
    } catch (Exception e) {
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
  }



  /**
   * Used to obtain order times for status of tables.
   * 
   * @param body the request body from the client
   * @return the time order was placed for Tables
   */
  @PostMapping("/orderTimes")
  public ResponseEntity<String> orderTimes(@RequestBody String body) {
    JSONParser parser = new JSONParser();
    try {
      JSONObject req = (JSONObject) parser.parse(body);
      switch ((String) req.get("request")) {
        case "getOrderPlacedTime":
          try {
            Integer orderID = (int) ((long) req.get("orderID"));
            Integer tabID = (int) ((long) req.get("tabID"));
            return new ResponseEntity<>(OrderService.getOrderPlacedTime(orderID, tabID),
                HttpStatus.OK);
          } catch (SQLException e) {
            e.printStackTrace();
            return new ResponseEntity<String>("error while getting data",
                HttpStatus.INTERNAL_SERVER_ERROR);
          }
        default:
          return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
      }
    } catch (Exception e) {
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
  }
}


