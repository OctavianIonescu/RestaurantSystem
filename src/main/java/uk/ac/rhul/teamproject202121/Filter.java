package uk.ac.rhul.teamproject202121;

import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

/**
 * This is a class for filtering the menu down based on a number of rules.
 * 
 * @author Team21
 *
 */
public class Filter {

  ArrayList<String> listdata = new ArrayList<String>();

  /**
   * Gets the meals that remain after the menu has been filtered. For example: filter out all
   * non-vegan food.
   * 
   * @return collection of meals that meet the requirements.
   * @throws IOException there is an issue with retrieving the data
   * @throws ParseException the data wasn't formatted as we expected.
   */
  public ArrayList<String> getMeals() throws IOException, ParseException {

    JSONParser parser = new JSONParser();
    Object obj = parser.parse(new FileReader("testData.JSON"));

    JSONObject jsonObject = (JSONObject) obj;

    // JSONArray Meals = (JSONArray) jsonObject.get("Starter");

    JSONArray meals = (JSONArray) jsonObject.get("categoryName");

    if (meals != null) {
      for (int i = 0; i < meals.size(); i++) {
        listdata.add(meals.toJSONString());
      }
    }


    // Iterator<JSONObject> iterator = Meals.iterator();
    // while (iterator.hasNext()) {
    // Meals.add(iterator.next());
    // }

    return listdata;

  }
}
