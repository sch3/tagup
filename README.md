# tagup
Heroku app url: fast-sierra-74790.herokuapp.com
To startup:

node server.js

Should print message to terminal in localhost.
If hosted in cloud, no setup necessary and it should already be running

APIs:

GET /api/listList all the records
Example: fast-sierra-74790.herokuapp.com/api/list
POST /api/createCreate a record
Example: 
curl -X POST \
  http://fast-sierra-74790.herokuapp.com/api/create \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
	"timestamp" : "1532220955",
	"value1" : 345.4,
	"value2" : 1.67,
    "value3": 0
}'
GET /api/read/:recordIdRead a specific record
Example: fast-sierra-74790.herokuapp.com/api/read/5
PUT /api/modify/:recordIdUpdate a specific record
curl -X PUT \
  http://fast-sierra-74790.herokuapp.com/api/modify/2 \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
	"value1" : 57.1,
	"value2" : 5.34,
	"value3" : 12398,
	"timestamp" : "1532222250"
}'
DELETE /api/remove/:recordIdDelete a specific record. Can switch out recordId for ‘all’ to clear table
Example: fast-sierra-74790.herokuapp.com/api/remove/1

GET /api/unique/:columnName
counts and retrieves unique columns in given column
Example: fast-sierra-74790.herokuapp.com/api/unique/timestamp

GET /api/status:
Returns number of columns and creation date of db
Example: http://fast-sierra-74790.herokuapp.com/api/status

