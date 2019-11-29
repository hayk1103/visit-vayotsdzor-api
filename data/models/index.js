'use strict';

const fs = require('fs');
const pg = require('pg');
const _ = require('lodash');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const config = require('../../config');
const db = {};

delete pg.native;

const sequelize = new Sequelize(config.get('db:database'), config.get('db:username'), config.get('db:password'), {
    logging: config.get('db:logging') ? console.log : false,
    operatorsAliases: Sequelize.Op.Aliases,
    dialect: config.get('db:dialect'),
    host: config.get('db:host'),
    freezeTableName: true
});

fs.readdirSync(__dirname)
    .filter(file => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
    .forEach(file => {
        const model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }

    if (db[modelName].addScopes) {
        db[modelName].addScopes(db);
    }

    db[modelName].generateNestedQuery = query => {
        return sequelize.literal(
            `(${sequelize
                .getQueryInterface()
                .QueryGenerator.selectQuery(db[modelName].getTableName(), query)
                .slice(0, -1)})`
        );
    };
});

db.generateSearchQuery = (string, fields = ['firstName', 'lastName']) => {
    const permArr = [];
    const newArray = [];
    const usedChars = [];

    let strings = _.words(string);

    if (strings.length > 5) {
        strings = [
            strings[0],
            strings[1],
            strings[2],
            strings[3],
            strings[4],
            strings.slice(5, strings.length).join(' ')
        ];
    }

    for (let i = 0; i < fields.length; i++) {
        newArray.push(sequelize.col(fields[i]));

        if (fields.length !== i + 1) {
            newArray.push(' ');
        }
    }

    const columns = sequelize.fn('concat', ...newArray);

    function generateQueryString(input) {
        let i, ch;

        for (i = 0; i < input.length; i++) {
            ch = input.splice(i, 1)[0];
            usedChars.push(ch);

            if (input.length === 0) {
                permArr.push(
                    sequelize.where(columns, {
                        $like: `%${usedChars.slice().join('%')}%`
                    })
                );
            }

            generateQueryString(input);
            input.splice(i, 0, ch);
            usedChars.pop();
        }

        return permArr;
    }

    return { $or: generateQueryString(strings) };
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
