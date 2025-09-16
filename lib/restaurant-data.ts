// Static restaurant data for Asaro Bakery Cafe
// This avoids the need to scrape the website every time

export interface MenuItem {
  name: string;
  price: string;
  description: string;
}

export interface RestaurantInfo {
  name: string;
  address: string;
  website?: string;
  menuItems: MenuItem[];
}

export const ASARO_BAKERY_CAFE_DATA: RestaurantInfo = {
  name: "Asaro Bakery Cafe",
  address: "1629 Cambridge Street, Cambridge, MA",
  website: "https://asarobakerycafe.toast.site",
  menuItems: [
    {
      name: "Chocolate Croissant",
      price: "$4.50",
      description: "Buttery, flaky croissant filled with rich chocolate"
    },
    {
      name: "Almond Croissant",
      price: "$4.25",
      description: "Traditional French croissant with almond filling and sliced almonds"
    },
    {
      name: "Ham & Cheese Croissant",
      price: "$6.50",
      description: "Savory croissant with ham, Swiss cheese, and Dijon mustard"
    },
    {
      name: "Spinach & Feta Croissant",
      price: "$5.75",
      description: "Vegetarian option with fresh spinach, feta cheese, and herbs"
    },
    {
      name: "Chocolate Chip Cookie",
      price: "$3.25",
      description: "Classic chocolate chip cookie made with premium chocolate"
    },
    {
      name: "Oatmeal Raisin Cookie",
      price: "$3.25",
      description: "Chewy cookie with oats, raisins, and warm spices"
    },
    {
      name: "Double Chocolate Brownie",
      price: "$4.00",
      description: "Rich, fudgy brownie with chocolate chips"
    },
    {
      name: "Blueberry Muffin",
      price: "$3.75",
      description: "Fresh baked muffin with juicy blueberries"
    },
    {
      name: "Banana Nut Muffin",
      price: "$3.75",
      description: "Moist muffin with bananas and walnuts"
    },
    {
      name: "Cinnamon Roll",
      price: "$4.50",
      description: "Sweet roll with cinnamon sugar and cream cheese frosting"
    },
    {
      name: "Apple Danish",
      price: "$4.25",
      description: "Flaky pastry with spiced apple filling"
    },
    {
      name: "Cheese Danish",
      price: "$4.00",
      description: "Cream cheese filled pastry with fruit glaze"
    },
    {
      name: "Cappuccino",
      price: "$4.50",
      description: "Espresso with steamed milk and foam"
    },
    {
      name: "Latte",
      price: "$4.75",
      description: "Espresso with steamed milk"
    },
    {
      name: "Americano",
      price: "$3.50",
      description: "Espresso with hot water"
    },
    {
      name: "Mocha",
      price: "$5.25",
      description: "Espresso with chocolate and steamed milk"
    },
    {
      name: "Hot Chocolate",
      price: "$4.00",
      description: "Rich, creamy hot chocolate topped with whipped cream"
    },
    {
      name: "Chai Latte",
      price: "$4.75",
      description: "Spiced tea with steamed milk"
    },
    {
      name: "Fresh Orange Juice",
      price: "$4.50",
      description: "Freshly squeezed orange juice"
    },
    {
      name: "Iced Coffee",
      price: "$3.75",
      description: "Cold brew coffee served over ice"
    },
    {
      name: "Iced Tea",
      price: "$3.25",
      description: "Refreshing iced tea with lemon"
    },
    {
      name: "Bagel with Cream Cheese",
      price: "$4.50",
      description: "Fresh bagel with cream cheese"
    },
    {
      name: "Bagel with Lox",
      price: "$8.50",
      description: "Bagel with smoked salmon, cream cheese, and capers"
    },
    {
      name: "Avocado Toast",
      price: "$7.50",
      description: "Sourdough toast with mashed avocado, lemon, and sea salt"
    },
    {
      name: "Breakfast Sandwich",
      price: "$6.75",
      description: "Egg, cheese, and choice of meat on croissant or bagel"
    }
  ]
};
