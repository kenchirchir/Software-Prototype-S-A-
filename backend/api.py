from flask import Flask, jsonify, request
import requests
import mysql.connector

app = Flask(__name__)
url = "https://jsonplaceholder.typicode.com/"

# Connect to MySQL Database
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="yourpassword",
    database="yourdatabase"
)

@app.route("/")
def hello(): 
    return '<h1>API<h1>'

@app.route("/users", methods=["GET"])
def get_users():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT username, first_name, last_name FROM users")  # Fetch data from DB
    data = cursor.fetchall()  # Convert to list of dictionaries
    return jsonify(data)  # Return as JSON response

@app.route("/products", methods=["GET"])
def get_products():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT name, description, SKU, category_id, price FROM product")  # Fetch data from DB
    data = cursor.fetchall()  # Convert to list of dictionaries
    return jsonify(data), 201  # Return as JSON response

@app.route("/add_user", methods=["POST"])
def add_user():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    telephone = data.get("telephone")


    cursor = db.cursor()

    # Check if username exists
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    existing_user = cursor.fetchone()

    if existing_user:
        return jsonify({"error": "Username already exists"}), 409

    cursor.execute("INSERT INTO users (name, email, password, first_name, last_name, telephone) VALUES (%s, %s, %s, %s, %s, %s)", (username, email, password, first_name, last_name, telephone))
    db.commit()
    return jsonify({"message":"User added successfully"}), 201

@app.route("/categories", methods=["GET"])
def get_categories():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT name, description FROM product_category")  # Fetch data from DB
    data = cursor.fetchall()  # Convert to list of dictionaries
    return jsonify(data)

@app.route("users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id))
    data = cursor.fetchall()
    return jsonify(data)

@app.route("add_item_to_cart", methods=["POST"])
def add_item_to_cart():
    data = request.json
    user_id = data.get("user_id")
    product_id = data.get("product_id")
    quantity = data.get("quantity")

    cursor = db.cursor()
    cursor.execute("INSERT INTO cart_item (user_id, product_id, quantity) VALUES (%s, %s, %s)", (user_id, product_id, quantity))
    db.commit()
    return jsonify({"message": "Item added to cart successfully"}), 201

@app.route("cart/<int:user_id>", methods=["GET"])
def get_cart(user_id):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cart_item WHERE user_id = %s", (user_id))
    data = cursor.fetchall()
    return jsonify(data)



# @app.route("/api/users", methods=["GET"])
# def get_():
#     data = requests.get(url + "users")
#     json_data = data.json()
#     return jsonify(json_data)

#  ----Customer landing page----
# list products DONE
# list product categories DONE

# ----Customer account page----
# user profile DONE
# order history

# ----Customer checkout page----
# add item to cart DONE
# list cart items DONE
# address 
# payment details

# ----Admin page----
# list orders

# ----Seller dashboard----
# list product inventory
# order items



if __name__ == "__main__":
    app.run(debug=True)