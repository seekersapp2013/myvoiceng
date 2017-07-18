'use strict';
const request = require('request');
const config = require('./config');
const pg = require('pg');
pg.defaults.ssl = true;

module.exports = {

    readAllColors: function(callback) {
        pg.connect(process.env.DATABASE_URL, function(err, client) {
            if (err) throw err;
            client
                .query(
                    'SELECT color FROM public.power_issues',
                    function(err, result) {
                        if (err) {
                            console.log(err);
                            callback([]);
                        } else {
                            let colors = [];
                            for (let i = 0; i < result.rows.length; i++) {
                                colors.push(result.rows[i]['color']);
                            }
                            callback(colors);
                        };
                    });
        });
    },


    readUserColor: function(callback, userId) {
        pg.connect(process.env.DATABASE_URL, function(err, client) {
            if (err) throw err;
            client
                .query(
                    'SELECT color FROM public.user_color WHERE fb_id=$1',
                    [userId],
                    function(err, result) {
                        if (err) {
                            console.log(err);
                            callback('');
                        } else {
                            console.log('rows SELECT color FROM public.user_color WHERE fb_id='+userId);
                            console.log(result);
                            console.log(result.rows);
                            callback(result.rows[0]['color']);
                        };
                    });
        });
    },

    updateUserColor: function(color, userId) {
        pg.connect(process.env.DATABASE_URL, function (err, client) {
            if (err) throw err;
            let rows = [];
            let sql1 = `SELECT color FROM user_color WHERE fb_id='${userId}' LIMIT 1`;
            client
                .query(sql1)
                .on('row', function (row) {
                    rows.push(row);
                })
                .on('end', () => {
                    let sql;
                    if (rows.length === 0) {
                        sql = 'INSERT INTO public.user_color (color, fb_id) VALUES ($1, $2)';
                    } else {
                        sql = 'UPDATE public.user_color SET color=$1 WHERE fb_id=$2';
                    }
                    client.query(sql,
                        [
                            color,
                            userId

                        ])
                        .on('error', function(err) {
                            console.log('Query error: ' + err + ' sql: ' + sql);
                        });
                })
                .on('error', function(err) {
                    console.log('Query error: ' + err);
                });
        });
    }


}
