'use strict';

const _ = require('lodash');

const { CategoryType } = require('../../constants');
const config = require('../../config');

const { id: categoryTemplateId } = config.get('params:model:seedData:categories');
const categoryUUID = _.template(categoryTemplateId);

module.exports = {
    async up(queryInterface) {
        const categories = [];
        let i = 0;

        for (let alias in CategoryType) {
            if (CategoryType.hasOwnProperty(alias)) {
                const categoryIndex = i < 10 ? `00${i}` : i < 100 ? `0${i}` : i;
                const id = categoryUUID({ index: categoryIndex });
                const title = CategoryType[alias];

                categories.push({ id, title, alias });
                i++;
            }
        }

        const categoriesData = await queryInterface.bulkInsert('category', categories, {
            ignoreDuplicates: true,
            returning: true
        });

        if (_.isEmpty(categoriesData)) {
            console.log('Category already exist');
        }
    },

    async down(queryInterface) {
        const categoryIds = [];
        let i = 0;

        for (let alias in CategoryType) {
            if (CategoryType.hasOwnProperty(alias)) {
                const categoryIndex = i < 10 ? `00${i}` : i < 100 ? `0${i}` : i;
                const id = categoryUUID({ index: categoryIndex });

                categoryIds.push(id);
                i++;
            }
        }

        await queryInterface.bulkDelete('category', { id: categoryIds });
    }
};
