from flask import Flask, render_template, request
from datetime import datetime

import os
app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/fileSave', methods=['POST'])
def autoSave():

    s = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    try:
        data = request.json['data']
        userID = request.json['userID']
    except:
        pass

    try:
        print(userID)
        directory = 'tmp/' + userID
        if not os.path.exists(directory):
            os.mkdir(directory)

        with open('tmp/'+ userID +'/' + s + '_tmp.json', 'w') as f:
            f.write(str(data))
    except:
        pass

    return 'saved'

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0',port=8885)
