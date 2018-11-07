
'use strict';
const async = require('async');
const log = require('../common/log');
const cluster = require('../model/cluster');
const userAcl = require('../model/user_acl');

/**
 * @api {post} /api/worker/:id/delete
 */
exports.removeWorker = function (req, callback) {
  let clusterCode = req.query.clusterCode || 'default';
  let ip = req.query.ip;
  req.oplog({
    clientId: req.ips.join('') || '-',
    opName: 'REMOVE_WORKER',
    opType: 'PAGE_MODEL',
    opLogLevel: 'NORMAL',
    opItem: 'WORKER',
    opItemId: ip
  });
  log.info('delete worker: ', ip, clusterCode);
  cluster.deleteWorker(ip, clusterCode, function (err) {
    if (err) {
      log.error(`delete worker: ${ip} failed:`, err);
      return callback({code: err.code || 'ERROR', message: err.message});
    }
    callback(null, 'remove worker success');
  });
};

/**
 * @api {post} /api/worker/create
 */
exports.addWorker = function (req, callback) {
  let ip = req.body.ip;
  let clusterCode = req.body.clusterCode || 'default';
  req.oplog({
    clientId: req.ips.join('') || '-',
    opName: 'ADD_WORKER',
    opType: 'PAGE_MODEL',
    opLogLevel: 'NORMAL',
    opItem: 'WORKER',
    opItemId: ip
  });
  log.info('add worker: ', ip, clusterCode);
  cluster.addWorker(ip, clusterCode, function (err) {
    if (err) {
      log.error(`add worker: ${ip} failed:`, err);
      return callback({code: err.code || 'ERROR', message: err.message});
    }
    callback(null, 'add worker success');
  });
};

/**
 * @api {get} /api/worker/tmp/register
 * @query
 *    ip
 *    cluster
 */
exports.registerWorker = function (req, callback) {
  let ip = req.query.ip;
  let clusterCode = req.query.cluster || 'default';
  req.oplog({
    clientId: req.ips.join('') || '-',
    opName: 'REGISTER_WORKER',
    opType: 'PAGE_MODEL',
    opLogLevel: 'NORMAL',
    opItem: 'WORKER',
    opItemId: ip
  });
  log.info('register worker: ', ip, clusterCode);
  cluster.addTmpWorker(ip, clusterCode, function (err) {
    if (err) {
      log.error(`add worker: ${ip} failed:`, err);
      return callback({code: err.code || 'ERROR', message: err.message});
    }
    callback(null, 'register tmp worker success');
  });
};

/**
 * @api {delete} /api/worker/tmp/:id
 */
exports.deleteTmpWorker = function (req, callback) {
  let ip = req.params.id;
  req.oplog({
    clientId: req.ips.join('') || '-',
    opName: 'DEL_TMP_WORKER',
    opType: 'PAGE_MODEL',
    opLogLevel: 'NORMAL',
    opItem: 'WORKER',
    opItemId: ip
  });
  log.info('delete tmp worker: ', ip, clusterCode);
  cluster.deleteTmpWorker(id, function (err) {
    if (err) {
      log.error(`delete tmp worker: ${ip} failed:`, err);
      return callback({code: err.code || 'ERROR', message: err.message});
    }
    callback(null, 'del tmp worker success');
  });
};

