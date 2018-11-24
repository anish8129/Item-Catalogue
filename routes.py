from flask import Flask,url_for,redirect,render_template,request,jsonify,flash
from sqlalchemy import create_engine, asc
from sqlalchemy.orm import sessionmaker
from database import Base,Category,Item,User
import json

from flask import session as login_session
import random,string

from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError
import httplib2
import json
from flask import make_response
import requests


app = Flask(__name__)




CLIENT_ID = json.loads(
    open('client_secrets.json', 'r').read())['web']['client_id']

# Connect to Database and create database session
engine = create_engine('sqlite:///item_catalog.db')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
sessn = DBSession()

def createUser(login_session):
    try:
        user=User(id=login_session['user_id'],name=login_session['email'],picture=login_session['picture'])
        sessn.add(user)
        print('commit')
        sessn.commit()
        print("Executed")
    except:
        print("Error Executed")
        return "Cannot add"
    return login_session['user_id']

def getUserInfo(user_id):
    user=None
    try:
        user = sessn.query(User).filter_by(id=user_id).one()
    except:
        return None
    return user

def getUserID(email):
    user=None
    try:
        user = sessn.query(User).filter_by(name=email).one()
    except:
        return None
    return user.id



@app.route('/gconnect', methods=['POST'])
def gconnect():
    # Validate state token
    if request.args.get('state') != login_session['state']:
        response = make_response(json.dumps('Invalid state parameter.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response
    # Obtain authorization code
    code = request.data

    try:
        # Upgrade the authorization code into a credentials object
        oauth_flow = flow_from_clientsecrets('client_secrets.json', scope='')
        oauth_flow.redirect_uri = 'postmessage'
        credentials = oauth_flow.step2_exchange(code)
    except FlowExchangeError:
        response = make_response(
            json.dumps('Failed to upgrade the authorization code.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Check that the access token is valid.
    access_token = credentials.access_token
    url = ('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=%s'
           % access_token)
    h = httplib2.Http()
    result = json.loads(h.request(url, 'GET')[1])
    # If there was an error in the access token info, abort.
    if result.get('error') is not None:
        response = make_response(json.dumps(result.get('error')), 500)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Verify that the access token is used for the intended user.
    gplus_id = credentials.id_token['sub']
    if result['user_id'] != gplus_id:
        response = make_response(
            json.dumps("Token's user ID doesn't match given user ID."), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Verify that the access token is valid for this app.
    if result['issued_to'] != CLIENT_ID:
        response = make_response(
            json.dumps("Token's client ID does not match app's."), 401)
        print ("Token's client ID does not match app's.")
        response.headers['Content-Type'] = 'application/json'
        return response

    stored_access_token = login_session.get('access_token')
    stored_gplus_id = login_session.get('gplus_id')
    if stored_access_token is not None and gplus_id == stored_gplus_id:
        response = make_response(json.dumps('Current user is already connected.'),
                                 200)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Store the access token in the session for later use.
    login_session['access_token'] = credentials.access_token
    login_session['gplus_id'] = gplus_id

    # Get user info
    userinfo_url = "https://www.googleapis.com/oauth2/v1/userinfo"
    params = {'access_token': credentials.access_token, 'alt': 'json'}
    answer = requests.get(userinfo_url, params=params)
    data = answer.json()
    print('data we got from .................................',data)

    print('data we got from ....................................')
    login_session['provider'] = 'google'
    login_session['picture'] = data['picture']
    login_session['email'] = data['email']
    login_session['user_id'] = int(data['id'][-5:])

    if getUserInfo(login_session['user_id']) is None:
        createUser(login_session)
    return jsonify(email=login_session['email'],picture=login_session['picture'],id=login_session['user_id'])


@app.route('/gdisconnect')
def gdisconnect():
    access_token = login_session.get('access_token')
    if access_token is None:
        print('Access Token is None')
        response = make_response(json.dumps('Current user not connected.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response
    print('In gdisconnect access token is %s', access_token)
    print ('User name is: ')
    print(login_session['email'])
    url = 'https://accounts.google.com/o/oauth2/revoke?token=%s' % login_session['access_token']
    h = httplib2.Http()
    result = h.request(url, 'GET')[0]
    print('result is ')
    print(result)
    if result['status'] == '200':
        del login_session['access_token']
        del login_session['gplus_id']
        del login_session['email']
        del login_session['picture']
        del login_session['user_id']
        response = make_response(json.dumps('Successfully disconnected.'), 200)
        response.headers['Content-Type'] = 'application/json'
        return response
    else:
        response = make_response(json.dumps('Failed to revoke token for given user.', 400))
        response.headers['Content-Type'] = 'application/json'
        return response


@app.route('/')
def homepage():
    state=''.join(random.choice(string.ascii_uppercase + string.digits) for x in range(32))
    login_session['state']=state
    return render_template('categories.html',STATE=state)



@app.route('/categories/')
def categories():
    print('Hello')
    category_list = sessn.query(Category).all()
    count=sessn.query(Category).count()
    return jsonify(categories=[r.serialize for r in category_list],count=count)


@app.route('/categories/create/',methods=['POST'])
def create_category():
    if request.method=='POST':
        if 'email' not in login_session:
            return jsonify(message='Access Denied')
        category=request.get_json()
        try:
            if category['name']=='':
                return jsonify(message='Name field cannot be empty') 
            c=Category(name=category['name'],user_id=int(login_session['user_id']))
            sessn.add(c)
            sessn.commit()
        except:
           return jsonify(message='Failed to add Category',category=(category))    
    return jsonify(message='Added Category',category=(category))

@app.route('/categories/<int:id>/edit/',methods=['PUT'])
def edit_category(id):
    if 'email' not in login_session:
        return jsonify(message='Access Denied')    
    if request.method =='PUT':
        print("Helllo 2")
        category=request.get_json()
        try:
            c=sessn.query(Category).filter_by(id=id).one()
            print(str(type(c.user_id))+   "    "+  str(type(login_session['user_id'])))
            if c.user_id != login_session['user_id']:
                return jsonify(message='You are not authorized to update this Category')
            if category['name']=='':
                return jsonify(message='Name field is empty !! Cannot update')
            c.name=category['name']
            sessn.commit()
        except:
            return jsonify(message='Failed to Update Category',)    
    return jsonify(message='Successfully Updated Category',category=(category))

@app.route('/categories/<int:category_id>/delete/',methods=['DELETE'])
def delete_category(category_id):
    category=None
    if 'email' not in login_session:
        return jsonify(message='Access Denied')
    try:
        category=sessn.query(Category).filter_by(id=category_id).one()
        if category.user_id != login_session['user_id']:
            return jsonify(message='You are not authorized to delete this Category')
        sessn.delete(category)
        sessn.commit()
    except:
        return jsonify(message="Failed to Delete")
    return jsonify(category=category.serialize,message="Deleted Successfully")



@app.route('/categories/<int:id>/items/')
def items_by_categories(id):
    category = sessn.query(Category).filter_by(id=id).one()
    items=sessn.query(Item).filter_by(category_id=category.id).all()
    count=sessn.query(Item).filter_by(category_id=category.id).count()
    return jsonify(items=[r.serialize for r in items],count=count)


@app.route('/categories/<int:id>/items/create/',methods=['POST'])
def create_item(id):
    if 'email' not in login_session:
        return jsonify(message='Access Denied')
    
    category=sessn.query(Category).filter_by(id=id).one()
    if category.user_id==login_session['user_id']:
        i=request.get_json()
        item=None
        if i['name']=='':
            return jsonify(message="Name feild s empty!!!! Hence Failed to Update")
        if i['price']=='':
            return jsonify(message="Price  feild s empty!!!! Hence Failed to Update")
        if i['description']=='':
            return jsonify(message="Description feild s empty!!!! Hence Failed to Update")
        try:
            item=Item(name=i['name'],description=i['description'],price=i['price'],category=category,user_id=login_session['user_id'])
            sessn.add(item)
            sessn.commit()
        except:
            return jsonify(message="Failed to add")
    else:
        return jsonify(message='You not authorized to create Item in this category')
    return jsonify(message="Added Successfully")

@app.route('/categories/<int:category_id>/items/<int:item_id>/edit/',methods=['PUT'])
def edit_item(category_id,item_id):
    if 'email' not in login_session:
        return jsonify(message='Access Denied')
    item=None
    try:
        item=sessn.query(Item).filter_by(id=item_id,category_id=category_id).one()
        i=request.get_json()
        if item.user_id==login_session['user_id']: 
            if i['name']=='':
                return jsonify(message="Name feild s empty!!!! Hence Failed to Update")
            if i['price']=='':
                return jsonify(message="Price  feild s empty!!!! Hence Failed to Update")
            if i['description']=='':
                return jsonify(message="Description feild s empty!!!! Hence Failed to Update")
            item.price=i['price']
            item.name=i['name']
            item.description=i['description']        
            sessn.commit()
        else:
            return jsonify(message="You are not authorized to update")
    except:
        return jsonify(message="Failed to Update")
    return jsonify(item=item.serialize,message="Updated Successfully")

@app.route('/categories/<int:category_id>/items/<int:item_id>/delete/',methods=['DELETE'])
def delete_item(category_id,item_id):
    if 'email' not in login_session:
        return jsonify(message='Access Denied')
    item=None
    try:
        item=sessn.query(Item).filter_by(id=item_id,category_id=category_id).one()
        if item.user_id == login_session['user_id']:
            sessn.delete(item)
            sessn.commit()
        else:
            return jsonify(message="You are not authorized to delete this item")
    except:
        return jsonify(message="Failed to Delete")
    return jsonify(item=item.serialize,message="Deleted Successfully")




if __name__ == '__main__':
    app.secret_key = 'super_secret_key'
    app.debug = True
    app.run(host='0.0.0.0', port=5000,threaded=False)