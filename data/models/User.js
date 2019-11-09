'use strict';

const _ = require('lodash');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const PhoneNumber = require('awesome-phonenumber');

const { UserTokenType, UserStatus, GenderType, AccountType } = require('../lcp');
const { Security, Sanitize, File } = require('../../components');
const config = require('../../config');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            id: {
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            firstName: {
                allowNull: false,
                validate: { len: [2, 50] },
                type: DataTypes.STRING(50)
            },
            lastName: {
                allowNull: false,
                validate: { len: [2, 50] },
                type: DataTypes.STRING(50)
            },
            email: {
                allowNull: false,
                type: DataTypes.STRING,
                validate: { isEmail: true },
                unique: { message: 'email.unique' }
            },
            phone: {
                type: DataTypes.STRING,
                unique: { message: 'phone.unique' },
                validate: {
                    isValid(value) {
                        if (!PhoneNumber(value).isValid()) {
                            throw new Error('phone.not_valid');
                        }
                    }
                }
            },
            avatar: {
                type: DataTypes.STRING
            },
            gender: {
                type: DataTypes.ENUM,
                values: _.values(GenderType)
            },
            accountType: {
                allowNull: false,
                type: DataTypes.ENUM,
                values: _.values(AccountType)
            },
            status: {
                allowNull: false,
                type: DataTypes.ENUM,
                values: _.values(UserStatus),
                defaultValue: UserStatus.PENDING
            },
            dob: {
                type: DataTypes.DATEONLY,
                validate: {
                    isValid(value) {
                        if (moment().diff(value, 'years', false) < config.get('params:validation:age:min')) {
                            throw new Error('dob.min.age');
                        }
                    },
                    isDate: true
                }
            },
            password: {
                allowNull: false,
                type: DataTypes.STRING,
                validate: {
                    is: /(?=.*\d)(?=.*[a-z])(?=.*[!@#\\^&\])(?=.*[A-Z]).{6,}/
                }
            },
            accessTokenSalt: {
                type: DataTypes.STRING
            },
            forgotPasswordCode: {
                type: DataTypes.INTEGER
            },
            activationCode: {
                type: DataTypes.INTEGER
            }
        },
        {
            timestamps: true,
            tableName: 'user',
            setterMethods: {
                firstName(value) {
                    this.setDataValue('firstName', value ? _.trim(value) : null);
                },
                lastName(value) {
                    this.setDataValue('lastName', value ? _.trim(value) : null);
                },
                email(value) {
                    this.setDataValue('email', value ? validator.normalizeEmail(value) : null);
                },
                phone(value) {
                    this.setDataValue(
                        'phone',
                        PhoneNumber(value).isValid() ? PhoneNumber(value).getNumber() : value
                    );
                },
                dob(value) {
                    const dob = moment(value, 'YYYY-MM-DD');

                    this.setDataValue('dob', dob.isValid() ? dob.format('YYYY-MM-DD') : null);
                },
                password(value) {
                    this.setDataValue('password', value ? Sanitize.cleanPassword(value) : null);
                }
            }
        }
    );

    User.addHook('beforeSave', async user => {
        if (user.isNewRecord || user.changed('password')) {
            user.accessTokenSalt = Security.generateRandomString(6);
            user.password = await Security.generatePasswordHash(user.password);
        }
    });

    User.associate = models => {
        User.hasOne(models.Location, {
            as: 'location',
            foreignKey: 'userId'
        });

        User.hasOne(models.UserToken, {
            as: 'forgotPasswordToken',
            foreignKey: 'userId',
            scope: { type: UserTokenType.FORGOT_PASSWORD_TOKEN }
        });
    };

    User.prototype.comparePassword = function(candidatePassword = '') {
        return Security.validatePassword(candidatePassword, this.password);
    };

    User.prototype.enabled = function() {
        return this.status === UserStatus.ACTIVATED;
    };

    User.prototype.generateToken = function() {
        return {
            type: 'jwt',
            access: jwt.sign({ salt: this.accessTokenSalt, id: this.id }, config.get('jwt:secret'))
        };
    };

    User.prototype.toJSON = function() {
        const model = this.get();
        const hiddenFields = ['password', 'forgotPasswordCode', 'activationCode', 'accessTokenSalt'];
        if (!_.isEmpty(model.avatar)) {
            model.avatar = File.getObjectUrl(model.avatar);
        }

        return _.omit(model, hiddenFields);
    };

    return User;
};
