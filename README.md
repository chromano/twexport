# twexport

This is a small tool to help those who wants to export twitter data.

## Configuration

In order to deploy your own version of this app, you will need a twitter
application and its keys.

Inside `app/` directory, there's a credentials.json file. Use this file
to specify your twitter app keys.

## Running

### Docker

    $ docker build -t twexport .
    $ docker run -it --rm -P --name twexport twexport 

### Development

    $ gulp serve
