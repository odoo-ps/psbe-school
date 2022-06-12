/** @odoo-module **/


var ajax = require('web.ajax');
var core = require('web.core');

var _t = core._t;

const {Component, Store, mount, QWeb, xml} = owl;
const {useDispatch, useStore, useGetters, useRef, useState} = owl.hooks;
const {Router, RouteComponent} = owl.router;
const {whenReady} = owl.utils;

import {useService } from "@web/core/utils/hooks";


class LunchMenu extends Component {
    toggleMenu() {
        const kid = this.props.kid.id;
        const isset = this.props.menu.kids.includes(kid);
        for (var meal of this.props.meals) {
            var index = meal.kids.indexOf(kid);
            if (index > -1)
                delete meal.kids[index];
        };
        if (! isset)
            this.props.menu.kids.push(kid);
    };
    static props = ["menu", "kid", "meals"];
}
LunchMenu.template = "school_lunch.lunch_menu"


class LunchLine extends Component {
    static props = ["menu", "kids"];
    static components = { LunchMenu };
}
LunchLine.template = "school_lunch.lunch_line"


class LunchMenuTable extends Component {
    setup() {
        // this.rpc = useService("rpc");
        // this.rpc({
        //     route: `/school/get_orders`,
        //     params: {
        //         date: 1
        //     },
        // }).then(function (data) {
        //     this.kids = data.kids
        //     this.allergies = data.allergies
        //     this.menus = data.menus
        // });
        this.state = useState({ value: 1 });

        this.kids = [
            {id: 1, shortname: "Charlie"},
            {id: 2, shortname: "Lena"}
        ]
        this.allergies = [
            {id: 1, name: "Lentils"},
            {id: 2, name: "Apple"}
        ]
        this.menus = useState([
            {
                date: 'Wed, 04 May 2022',
                day_of_week: 2,
                meals: [
                    {id: 1, meal_type: "meal", state: "active", name: "Spaggethi", allergies: [{id: 2, name: "Apple"}], kids: [1]},
                    {id: 2, meal_type: "soup", state: "active", name: "Soup 1", allergies: [], kids:[]}
                ],
            },
            {
                date: 'Thu, 05 May 2022',
                day_of_week: 3,
                meals: [
                    {id: 1, meal_type: "meal", state: "active", name: "Spaggethi", allergies: [{id: 2, name: "Apple"}], kids: [1]},
                    {id: 2, meal_type: "soup", state: "active", name: "Soup 1", allergies: [], kids:[]}
                ],
            },
        ])
    };

    unselectAllergy() {
        const isset = this.props.menu.kids.includes(kid);
        const allergy = this.el.dataset.allergy;
        for (var menu of this.menus) {
            for (var meal of menu.meals) {
                for (var al of mean.allergies) {
                    if (al.id == allergy)
                        meal.kids.length = 0;
                }
            }
        }
    };
    selectMeal() {
        debugger;

        const isset = this.props.menu.kids.includes(kid);
        const meal_type = this.el.dataset.meal;
        const meal_day = this.el.dataset.day;

        for (var menu of this.menus) {
            if (meal_day && meal_day != menu.day_of_week)
                continue;
            for (var meal of menu.meals) {
                meal.kids.length = 0;
                if (meal.meal_type == meal_type) {
                    for (var kid in this.kids) {
                        meal.kids.push(kid.id);
                    }
                }
            }
        }
    };
    static components = { LunchLine }
}
LunchMenuTable.template = "school_lunch.lunch_table";




async function makeEnvironment() {
    const env = {};
    const services = Component.env.services;
    const qweb = new QWeb({translateFn: _t});
    const templates = await owl.utils.loadFile('/school_lunch/static/src/xml/lunch_menu.xml');
    qweb.addTemplates(templates);
    return Object.assign(env, {qweb, services});
}

async function setup() {
    const env = await makeEnvironment();
    mount(LunchMenuTable, {target: document.getElementById('LunchMenu'), env});
}

whenReady(setup);
