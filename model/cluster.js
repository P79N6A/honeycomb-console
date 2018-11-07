'use strict';

const log = require('../common/log');
const db = require('../common/db');

const INSERT_SYSTEM_CLUSTER = `
  INSERT INTO hc_console_system_cluster
    (name, code, token, endpoint, gmt_create, gmt_modified)
  VALUES
    (?, ?, ?, ?, ?, ?) ;`;

exports.addCluster = function (name, code, token, endpoint, callback) {
  let d = new Date();
  db.query(
    INSERT_SYSTEM_CLUSTER,
    [name, code, token, endpoint, d, d],
    function (err) {
      if (err) {
        log.error('Insert new cluster failed:', err);
        return callback(err);
      } else {
        log.info('Add cluster success');
        callback();
      }
    }
  );
};

const UPDATE_SYSTEM_CLUSTER = `
  UPDATE hc_console_system_cluster
  SET status = 1, name = ?, token = ?, endpoint = ?, gmt_modified = ?
  WHERE code = ?;
`;
exports.updateCluster = function (name, code, token, endpoint, callback) {
  let d = new Date();
  db.query(
    UPDATE_SYSTEM_CLUSTER,
    [name, token, endpoint, d, code],
    function (err) {
      if (err) {
        log.error('Update cluster failed:', err);
        return callback(err);
      } else {
        log.info('update cluster success');
        callback();
      }
    }
  );
};

const DELETE_SYSTEM_CLUSTER = `
  DELETE FROM
    hc_console_system_cluster
  WHERE code = ?;`;
exports.deleteCluster = function (code, callback) {
  db.query(
    DELETE_SYSTEM_CLUSTER,
    [code],
    function (err) {
      if (err) {
        log.error('Delete cluster failed:', err);
        return callback(err);
      } else {
        log.info('Delete cluster success');
        callback();
      }
    }
  );
};

const INSERT_SYSTEM_WORKER = `
  INSERT INTO hc_console_system_worker
    (ip, cluster_code, gmt_create, gmt_modified)
  VALUES
    (?, ?, ?, ?);`;

exports.addWorker = function (ipAddress, clusterCode, callback) {
  let d = new Date();
  db.query(
    INSERT_SYSTEM_WORKER,
    [ipAddress, clusterCode, d, d],
    function (err) {
      if (err) {
        log.error('Insert new worker failed:', err);
        return callback(err);
      } else {
        log.info('Add worker success');
        callback(null);
      }
    }
  );
};

const INSERT_SYSTEM_WORKER_TMP = `
  INSERT INTO hc_console_system_worker_tmp
    (ip, cluster_code, gmt_create)
  VALUES
    (?, ?, ?);`;
const CHECK_SYSTEM_WORKER_TMP = `
  select count(*) as cc from hc_console_system_worker_tmp where ip=? and cluster_code=?
`

exports.addTmpWorker = function (ipAddress, clusterCode, callback) {
  let d = new Date();
  db.query(CHECK_SYSTEM_WORKER_TMP, [ipAddress, clusterCode], (err, data) => {
    if (err) {
      return callback(err);
    }
    if (data && data[0].cc > 0) {
      return callback(null);
    }
    db.query(
      INSERT_SYSTEM_WORKER_TMP,
      [ipAddress, clusterCode, d],
      function (err) {
        if (err) {
          log.error('Insert new worker failed:', err);
          return callback(err);
        } else {
          log.info('Add worker success');
          callback(null);
        }
      }
    );
  });
};

const DELETE_SYSTEM_WORKER = `
  DELETE FROM
    hc_console_system_worker
  WHERE
    ip = ? and cluster_code = ?;
`;

exports.deleteWorker = function (ipAddress, clusterCode, callback) {
  db.query(
    DELETE_SYSTEM_WORKER,
    [ipAddress, clusterCode],
    callback
  );
};

const DELETE_SYSTEM_WORKER_TMP = `
  DELETE FROM
    hc_console_system_worker
  WHERE
    id = ?;
`;

exports.deleteTmpWorker = function (id, callback) {
  db.query(
    DELETE_SYSTEM_WORKER_TMP,
    [id],
    callback
  );
};

const DELETE_SYSTEM_WORKERS = `
  DELETE FROM
    hc_console_system_worker
  WHERE
    cluster_code = ?;
`;

exports.deleteWorkers = function (clusterCode, callback) {
  db.query(
    DELETE_SYSTEM_WORKERS,
    [clusterCode],
    callback
  );
};

const QUERY_SYSTEM_WORKER = `
  SELECT ip
  FROM hc_console_system_worker
  WHERE
    cluster_code = ? AND status = 1;`;

exports.queryWorker = function (clusterCode, callback) {
  db.query(
    QUERY_SYSTEM_WORKER,
    [clusterCode],
    callback
  );
};

const SELECT_SYSTEM_CLUSTER_WOKER = `
  select
    b.name,
    b.code,
    b.token,
    b.endpoint,
    b.id,
    group_concat(a.ip) as ip
  from
    hc_console_system_cluster b
  join
    hc_console_system_worker a on a.status = 1 and b.status = 1 and a.cluster_code = b.code
  group by a.cluster_code`;

exports.getClusterCfg = function (cb) {
  db.query(SELECT_SYSTEM_CLUSTER_WOKER, function (err, data) {
    if (err || !data) {
      let e = new Error('SELECT_SYSTEM_CLUSTER failed: ' + err.message);
      log.error(err.message);
      return cb(e);
    }
    data = data || [];
    let clusterCfg = {};
    data.forEach(function (c) {
      clusterCfg[c.code] = {
        name: c.name,
        token: c.token,
        endpoint: c.endpoint,
        id: c.id,
        ips: c.ip.split(',')
      };
    });
    log.debug('clusterCfg from db: ', clusterCfg);
    exports.gClusterConfig = clusterCfg;
    cb(null, clusterCfg);
  });
};

exports.gClusterConfig = {};

exports.getClusterCfgByCode = function (clusterCode) {
  let opt = exports.gClusterConfig[clusterCode] || {};
  if (!opt.endpoint || !opt.token || !opt.ips) {
    let e = new Error('cluster config missing');
    log.error(e.message, 'clusterCfg: ', opt, 'clusterCode: ', clusterCode);
    return {
      code: 'ERROR',
      message: e.message
    };
  } else {
    return {
      endpoint: opt.endpoint,
      ips: opt.ips,
      token: opt.token
    };
  }
};
