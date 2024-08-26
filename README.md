# Pathvector-BGPStatus-Page

Pathvector BGPStatus Page is a page which show status of all your bgp sessions and also shows their type, if its an upstream, downstream or whatever.

This works exclusively with [Pathvector](https://pathvector.io)

# How it works?

My script runs command: pathvector s > /location/status.txt which exports the state of all sessions currently, it also converts the .txt to .csv.
Then that .csv file gets displayed on the webpage, meaning that the updates are not automatic, but you need to run the script every xxx, i personally run it every 30 seconds via crontab.

# Installation

You will need to have Pathvector setuped and running and nginx installed.

1) Download the files and unarchive them: `wget https://github.com/some/random/location && tar -xvzf some_random_name.tar.gz`
2) Create directory for web files: `mkdir /var/www/bgpstatus`
3) Move the files to the newly created directory: `mv -r some_random_name /var/www/bgpstatus`
4) Copy config from /var/www/bgpstatus/install/bgpstatus.conf to /etc/nginx/sites-avaliable and create symbolic link via: `ln -s /etc/nginx/sites/avaliable/bgpstatus.conf /etc/nginx/sites-enabled/`
5) Open config via: `nano /etc/nginx/sites/avaliable/bgpstatus.conf/bgpstatus.conf` and change domain.com to your domain name and location of your SSL certificate
6) Run `systemctl restart nginx`

Your status page should now be running! To configure it please follow the tutorial!

# Configuration
There are two ways of configuration:
  1) Single router

      1. Run `nano /var/www/bgpstatus/index.html` and delete/uncomment the block between # Single router - uncomment here
      2. Configure crontab for automatic updated of status page. Default value is every 30 seconds, if you wish to change that, change the value after sleep
            1. Run crontab -e
            2. Add this: * * * * * /var/www/bgpstatus/router1.sh
                         * * * * * sleep 30; /var/www/bgpstatus/router1.sh

  3) Multiple routers
      Only 2 routers now, guide for more routers coming soon!
      
      1. No configuration needed, only 2 routers now, support for more coming soon
      2. Configure crontab for automatic updates of status page. Default value is every 30 seconds, if you wish to change that, change the value after sleep
            Note: Crontab needs to be configured on all of your routers, this are my steps:
            Router1 (the one running status page):

                 a. Run crontab -e
                 b. Add this: * * * * * /var/www/bgpstatus/router1.sh
                              * * * * * sleep 30; /var/www/bgpstatus/router1.sh
            Router2 (the one not running the status page):

                   1. Download the router2.sh from your Router1
                   2. Place router2.sh into some reliable directory, like your home one
                   3. Modify line 66 from /your_location to location where you want to have the final router2.csv
                   2. Add this:   * * * * * /your_location_of_script/router2.sh
                                  * * * * * sleep 30; /your_location_of_script/router2.sh
                   3. Export the .csv file every 30seconds or your timeperiod to your main router.

You are up and running!
