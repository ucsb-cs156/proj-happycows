
# Deploying on Dokku

To deploy on dokku, see the instructions here:

* <https://ucsb-cs156.github.io/topics/dokku/deploying_an_app.html>

You will need the environment variables documented in the file `/docs/environment-variables.md` in this repo.

You will also need the command:

* <tt>dokku git:set <i>appname</i> keep-git-dir true</tt>

# Short Version

This short version omits many details, but if you are already familiar with the process of deploying applications, you may be able to use this.

Note that you may need to modify:
* `happycows` to `happycows-qa` or `happycows-cgaucho` (where `cgaucho` is your github id)
* `https://github.com/ucsb-cs156/proj-happycows` to `https://github.com/ucsb-cs156-f25/proj-happycows-f24-17` or whatever your repo's url is
* `main` to `my-branch-name` for your feature branch
* `yourEmail@ucsb.edu` to your own email
* values for `CLIENT_ID`, `CLIENT_SECRET` etc from [Google](https://github.com/ucsb-cs156/proj-happycows/blob/main/docs/oauth.md) or [Github](https://github.com/ucsb-cs156/proj-happycows/blob/main/docs/github-app-setup-dokku.md) as appropriate


## Deploying `happycows`

```
dokku apps:create happycows
dokku git:set happycows keep-git-dir true
dokku config:set --no-restart happycows PRODUCTION=true
dokku config:set --no-restart happycows SOURCE_REPO=https://github.com/ucsb-cs156-f25/proj-happycows-f25-xx
dokku postgres:create happycows-db
dokku postgres:link happycows-db happycows
dokku git:sync happycows https://github.com/ucsb-cs156-f25/proj-happycows-f25-xx main
dokku ps:rebuild happycows
dokku letsencrypt:set happycows email yourEmail@ucsb.edu
dokku letsencrypt:enable happycows
dokku config:set happycows --no-restart GOOGLE_CLIENT_ID=get-value-from-google
dokku config:set happycows --no-restart GOOGLE_CLIENT_SECRET=get-value-from-google
```

## Deploying `happycows-qa`

```
dokku apps:create happycows-qa
dokku git:set happycows-qa keep-git-dir true
dokku config:set --no-restart happycows-qa PRODUCTION=true
dokku config:set --no-restart happycows-qa SOURCE_REPO=https://github.com/ucsb-cs156-f25/proj-happycows-f25-xx
dokku postgres:create happycows-qa-db
dokku postgres:link happycows-qa-db happycows-qa
dokku git:sync happycows-qa https://github.com/ucsb-cs156-f25/proj-happycows-f25-xx main
dokku ps:rebuild happycows-qa
dokku letsencrypt:set happycows-qa email yourEmail@ucsb.edu
dokku letsencrypt:enable happycows-qa
dokku config:set happycows-qa --no-restart GOOGLE_CLIENT_ID=get-value-from-google
dokku config:set happycows-qa --no-restart GOOGLE_CLIENT_SECRET=get-value-from-google
```
