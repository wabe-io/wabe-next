--------------------------------------------------------------------------------------------------
wabe-ts
Wabe.io's NextJS Typescript utilities
--------------------------------------------------------------------------------------------------

Server worker environment parameters
------------------------------------

* Workers run mode

`auto` TODO
`load` Loads the worker but does not start it
`start` Loads and starts the worker

WORKERS

Workers accepts a comma-separated list of individual workers configuration in the form

[] optional
<> replace with real data
| mutually exclusive options

```
WORKERS=[<quantity to launch>][@]<worker name>[:][auto|load|start],<etc>
```

* BLOCK_ROUTES

`never`
Does not block routes in any case

`auto` (default)
Block all routes (except for "/wmgr") if workers are provisioned

* WORKER_MANAGER_MODE

`auto` (default)
In DEV environment, it will enable service routes and UI if at least one worker is provisioned. In PRODUCTION mode will disable both.

`force`
Enables service routes and UI. Will not start if no workers are assigned to this node.

`force-svc`
Enables service routes only. Will not start if no workers are assigned to this node.
