module.exports = {
  apps : [{
    name        : "server",
    cwd         : "/home/ec2-user/apps/freshcarton/freshcarton/server/",
    script      : "bin/www",
    watch       : true,
    ignore_watch: ["node_modules", "log",".git","tmp"],
    watch_options: {
        "followSymlinks": false
    },    
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
       "NODE_ENV": "production"
<<<<<<< HEAD
    },
    instances  : 4,
    exec_mode  : "cluster"
  }]
}
=======
    }
  }]
}
>>>>>>> 4240e34b80b48e6a653bae38bf45e279953df1c9
