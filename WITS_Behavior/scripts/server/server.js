const system = server.registerSystem(0, 0);

var players = [];

system.initialize = function () {
    system.listenForEvent("wits:send_player", (eventData) => addPlayer(eventData))
    system.listenForEvent("wits:fetch_block", (eventData) => getBlockFromPlayer(eventData))
    system.listenForEvent("minecraft:block_interacted_with", (eventData) => getBlockFromPlayer({
        data: {
            player: eventData.data.player,
            position: {
                x: eventData.data.block_position.x,
                y: eventData.data.block_position.y,
                z: eventData.data.block_position.z
            }
        }
    }))
    system.listenForEvent("minecraft:block_destruction_started", (eventData) => getBlockFromPlayer({
        data: {
            player: eventData.data.player,
            position: {
                x: eventData.data.block_position.x,
                y: eventData.data.block_position.y,
                z: eventData.data.block_position.z
            }
        }
    }))
    system.listenForEvent("minecraft:player_placed_block", (eventData) => getBlockFromPlayer({
        data: {
            player: eventData.data.player,
            position: {
                x: eventData.data.block_position.x,
                y: eventData.data.block_position.y,
                z: eventData.data.block_position.z
            }
        }
    }))

    system.registerEventData("wits:update_ui", {
        player: null,
        block: {
            identifier: null,
            info: '',
            namespace: null
        }
    })
    system.registerEventData("wits:unload_ui", {})

    let loggerData = system.createEventData("minecraft:script_logger_config");
    loggerData.data.log_information = true;
    loggerData.data.log_warnings = true;
    loggerData.data.log_errors = true;
    system.broadcastEvent("minecraft:script_logger_config", loggerData);
}

function getBlockFromPlayer(eventData) {
    let tickingArea = system.getComponent(eventData.data.player, "minecraft:tick_world").data.ticking_area;
    let playerPos = system.getComponent(eventData.data.player, "minecraft:position").data;

    let x = eventData.data.position.x;
    let y = eventData.data.position.y;
    let z = eventData.data.position.z;

    let playerX = playerPos.x;
    let playerY = playerPos.y;
    let playerZ = playerPos.z;

    let diffX = playerX - x;
    let diffY = playerY - y;
    let diffZ = playerZ - z;

    let distance = Math.sqrt(diffX * diffX + diffY * diffY + diffZ * diffZ)

    if (distance <= 6) {
        let block = system.getBlock(tickingArea, x, y, z);
        let blockstate = system.getComponent(block, "minecraft:blockstate");
        let namespace = block.__identifier__.slice(0, block.__identifier__.indexOf(":"));

        if (block.__identifier__ !== "minecraft:air") {
            let uiData = system.createEventData("wits:update_ui");
            uiData.data.block.identifier = block.__identifier__;
            if (blockstate.data !== null) {
                for (let state in blockstate.data) {
                    uiData.data.block.info += `${capitalize(state.replace(/_/g, " "))}: ${capitalize(blockstate.data[state].toString().replace(/_/g, " "))}\n`
                }
            }
            uiData.data.block.namespace = capitalize(namespace.replace(/_/g, " "));
            uiData.data.player = eventData.data.player;
            system.broadcastEvent("wits:update_ui", uiData);
        } else {
            system.broadcastEvent("wits:hide_ui", system.createEventData("wits:unload_ui"));
        }
    }
    else {
        system.broadcastEvent("wits:hide_ui", system.createEventData("wits:unload_ui"));
    }
}

function addPlayer(eventData) {
    players.push(eventData.data.player);
}

function capitalize(str) {
    return str.toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
}