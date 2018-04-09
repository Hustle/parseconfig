`parseconfig` is a command-line tool for schema migrations on the [Parse Platform](http://parseplatform.org/).

## Usage

The tool takes a schema file containing all the collections, functions, and triggers you want to configure Parse with (see below for an example). To apply the schema to a Parse database you need the master key and application id for that server. Once you have those run

```console
parseconfig apply <url where parse is> <location of schema file> -k <master key> -i <application id>
```

## Example Schema

```json
{
  "collections": [{
    "className": "Memo",
    "fields": {
      "objectId": {
        "type": "String"
      },
      "createdAt": {
        "type": "Date"
      },
      "updatedAt": {
        "type": "Date"
      },
      "ACL": {
        "type": "ACL"
      },
      "name": {
        "type": "String"
      },
      "author": {
        "type": "String"
      },
      "category": {
        "type": "String"
      },
      "deletedAt": {
        "type": "Date"
      }
    },
    "classLevelPermissions": {
      "find": {
        "role:user": true
      },
      "get": {
        "role:user": true
      },
      "create": {
        "role:admin": true
      },
      "update": {},
      "delete": {},
      "addField": {},
      "readUserFields": [],
      "writeUserFields": []
    },
    "indexes": {
      "author_index": {
        "author": 1
      }
    }
  }],
  "functions": [{
    "functionName": "launchMissiles",
    "url": "/hooks/functions/launchMissiles"
  }],
  "triggers": [{
    "className": "Memo",
    "triggerName": "beforeSave",
    "url": "/hooks/triggers/memo/validate"
  }]
}
```

## Development

To get the project running locally clone the repo then run

```console
yarn install; yarn build
```

The `dist` folder will now have executable files for you to run.
