/** @odoo-module **/

import {Component, loadFile, onWillStart, useState, whenReady} from "@odoo/owl";
import {templates} from "@web/core/assets";
import {useService} from "@web/core/utils/hooks";
import {mountComponent} from "@web/env";

class LunchKids extends Component {
    setup() {
        this.rpc = useService("rpc");
        this.classes = [];
        this.kids = useState([]);
        onWillStart(async () => {
            await this.classChange();
        });
    }
    async classChange() {
        const el = document.getElementById("o-class-select");
        const result = await this.rpc("/school/classes_get", {class_id: el && el.value});
        this.classes = result.classes;
        this.kids.length = 0;
        for (var kid of result.kids) this.kids.push(kid);
    }
}
LunchKids.template = "school_lunch.lunch_kids_form";

class LunchMenu extends Component {
    toggleMenu() {
        const kid = this.props.kid.id;
        const isset = this.props.menu.kids.includes(kid);
        for (var meal of this.props.meals) {
            var index = meal.kids.indexOf(kid);
            if (index > -1) meal.kids.splice(index, 1);
        }
        if (!isset) this.props.menu.kids.push(kid);
    }
    static props = ["menu", "kid", "meals"];
}
LunchMenu.template = "school_lunch.lunch_menu";

class LunchLine extends Component {
    static props = ["menu", "kids"];
    static components = {LunchMenu};
}
LunchLine.template = "school_lunch.lunch_line";

class LunchMenuTable extends Component {
    async setup() {
        this.rpc = useService("rpc");
        this.menus = useState([]);
        this.dt_block = useState([26]);
        this.dt_alert = useState([20]);
        this.readonly = useState([true]);
        onWillStart(() => this.orderPrepare());
    }
    async orderPrepare() {
        const result = await this.rpc("/school/order_prepare", {date: this.props.date});
        this.dt_block = result.dt_block;
        this.dt_alert = result.dt_alert;
        this.kids = result.kids;
        this.signin = result.signin;
        this.readonly = result.readonly;
        this.allergies = result.allergies;
        for (var menu of result.menus) {
            this.menus.push(menu);
        }
    }

    mealDisplay(menu, meal) {
        console.log(menu);
        return meal.kids.length;
    }

    unselectAllergy(ev) {
        const allergy = parseInt(ev.srcElement.dataset.allergy);
        for (var menu of this.menus) {
            for (var meal of menu.meals) {
                if (!allergy) meal.kids = [];

                for (var al of meal.allergies) {
                    if (al.id == allergy) meal.kids = [];
                }
            }
        }
    }

    async orderSet() {
        var orders = {};
        for (var menu of this.menus) {
            for (var meal of menu.meals) if (meal.kids.length) orders[meal.id] = meal.kids;
        }
        const result = await this.rpc("/school/order_set", {orders});
        if (result) window.location.href = "/shop/checkout?express=1";
    }

    async selectMeal(ev) {
        const meal_type = ev.srcElement.dataset.meal;
        const meal_day = parseInt(ev.srcElement.dataset.day);

        for (var menu of this.menus) {
            if (meal_day && meal_day != menu.day_of_week) continue;
            for (var meal of menu.meals) {
                meal.kids.length = 0;
                if (meal.meal_type == meal_type) {
                    for (var kid of this.kids) {
                        if (!meal.kids_ordered.includes(kid.id)) meal.kids.push(kid.id);
                    }
                }
            }
        }
    }
    static components = {LunchLine};
}
LunchMenuTable.template = "school_lunch.lunch_table";

async function loadTemplates() {
    const templates_to_add = await loadFile("/school_lunch/static/src/xml/lunch_menu.xml?uniq=" + Math.random());
    const doc = new DOMParser().parseFromString(templates_to_add, "text/xml");
    for (const element of doc.querySelectorAll("templates > [t-name]")) {
        templates.documentElement.appendChild(element);
    }
}

async function setup() {
    const elTable = document.getElementById("LunchMenu");
    const elKids = document.getElementById("LunchKids");

    await loadTemplates();

    if (elTable) {
        mountComponent(LunchMenuTable, elTable, {props: {date: elTable.dataset.date}});
    }
    if (elKids) {
        mountComponent(LunchKids, elKids);
    }
}

whenReady(setup);
