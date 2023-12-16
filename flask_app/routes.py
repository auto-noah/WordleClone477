# Author: Prof. MM Ghassemi <ghassem3@msu.edu>
from flask import current_app as app
from flask import render_template, redirect, request, session, url_for, copy_current_request_context
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect
from .utils.database.database  import database
from werkzeug.datastructures   import ImmutableMultiDict
from pprint import pprint
import json
import random
import functools
db = database()


#######################################################################################
# NEW WORD SCRAPING & GAME RELATED
#######################################################################################
import subprocess
import sys
def install_process(process_name):
    subprocess.check_call([sys.executable, "-m", "pip", "install", process_name])
try:
    from bs4 import BeautifulSoup
except:
    install_process("bs4")
    from bs4 import BeautifulSoup
import http.client


# Connect to daily word website
connection = http.client.HTTPSConnection('www.merriam-webster.com')
# Sent GET request
connection.request('GET','/word-of-the-day')
# Read HTML content and close connection
html_doc = connection.getresponse().read().decode('utf-8')
connection.close()
# Create soup object 
soup = BeautifulSoup(html_doc, 'html.parser')
# Find word in soup
daily_word = soup.find('h2', class_='word-header-txt').get_text()
	# NOW we have a word being updated daily and checked for refresh at initialization

# Give the daily word to the game (JS ONLY -> USER CAN'T READ VAR'S VALUE)
@app.route('/getDailyWord', methods = ["POST","GET"])
def getDailyWord():
	return {'success' : daily_word}

# User won/lost game
@app.route('/endGame', methods = ["POST","GET"])
def endGame():
	# Process feedback
	feedback = request.form
	feedback = feedback.to_dict()

	# Update the user's account with their new daily score
	db.updateScore(email=getUser(), daily_score=feedback['daily_score'])

	# return to JavaScript game logic
	return {'success' : 1}

# Take user to leaderboard
@app.route('/leaderboard')
def leaderboard():
	# Get the top scores from leaderboard and go to leaderboard
	leaderboard_info = db.query("SELECT email, daily_score FROM users ORDER BY daily_score;")
	return render_template('leaderboard.html', daily_word=daily_word, leaderboard_info=leaderboard_info)



#######################################################################################
# AUTHENTICATION RELATED
#######################################################################################
def login_required(func):
    @functools.wraps(func)
    def secure_function(*args, **kwargs):
        if "email" not in session:
            return redirect(url_for("login", next=request.url))
        return func(*args, **kwargs)
    return secure_function

def getUser():
	return db.reversibleEncrypt('decrypt', session['email']) if 'email' in session else 'Unknown'

@app.route('/login')
def login():
	return render_template('login.html', user=getUser())

@app.route('/logout')
def logout():
	session.pop('email', default=None)
	return redirect('/login')

@app.route('/processlogin', methods = ["POST","GET"])
def processlogin():
	# Grab user login data from form
	form_fields = dict((key, request.form.getlist(key)[0]) for key in list(request.form.keys()))
	
	# Encrypt user's email for session
	session['email'] = db.reversibleEncrypt('encrypt', form_fields['email']) 

	# Authenticate the user's input data
	auth_res = db.authenticate(email=form_fields['email'], password=form_fields['password'])
	return json.dumps(auth_res) 

@app.route('/signup')
def signup():
	return render_template('signup.html')

@app.route('/processsignup', methods = ["POST","GET"])
def processsignup():
	# Grab user sign up data from form
	form_fields = dict((key, request.form.getlist(key)[0]) for key in list(request.form.keys()))

	# Authenticate the user's input data
	auth_res = db.authenticate(email=form_fields['email'], password=form_fields['password'])
	if auth_res == {'success' : 1}: # User already registered
		return {'success' : 0}
	else:                           # User not yet registered
		# Encrypt user's email for session
		session['email'] = db.reversibleEncrypt('encrypt', form_fields['email'])

		# Create account
		db.createUser(email=form_fields['email'], password=form_fields['password'], role='guest')

		return {'success' : 1}



#######################################################################################
# OTHER
#######################################################################################
@app.route('/')
def root():
	return redirect('/login')

@app.route('/home')
def home():
	if getUser() == 'Unknown' or getUser() == '':
		return render_template('login.html')
	
	return render_template('home.html', user=getUser()) # PASS DAILY WORD INTO HTML THROUGH JS AFTER USER WINS
				 									    # SO IT DOES NOT LEAK THE DAILY WORD TO THE USER

@app.after_request
def add_header(r):
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, public, max-age=0"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    return r