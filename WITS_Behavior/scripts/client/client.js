const system = client.registerSystem(0, 0);

var player = undefined;

system.initialize = function () {
    system.listenForEvent("minecraft:client_entered_world", (eventData) => setPlayer(eventData))
    system.listenForEvent("minecraft:hit_result_changed", (eventData) => checkBlock(eventData));
    system.listenForEvent("wits:update_ui", (eventData) => updateUI(eventData))
    system.listenForEvent("wits:hide_ui", (eventData) => hideUI(eventData))

    system.registerEventData("wits:fetch_block", {
        position: {
            x: null,
            y: null,
            z: null
        },
        player: null
    })
    system.registerEventData("wits:send_player", {
        player: null
    }) 

    let loggerData = system.createEventData("minecraft:script_logger_config");
    loggerData.data.log_information = true;
    loggerData.data.log_warnings = true;
    loggerData.data.log_errors = true;
    system.broadcastEvent("minecraft:script_logger_config", loggerData);
}

function setPlayer(eventData) {
    player = eventData.data.player;

    let uiOptions = system.createEventData("minecraft:load_ui");
    uiOptions.data.path = "wits_indicator.html";
    uiOptions.data.options.always_accepts_input = false;
    uiOptions.data.options.render_game_behind = true;
    uiOptions.data.options.absorbs_input = false;
    uiOptions.data.options.is_showing_menu = false;
    uiOptions.data.options.should_steal_mouse = true;
    uiOptions.data.options.force_render_below = true;
    uiOptions.data.options.render_only_when_topmost = false;
    system.broadcastEvent("minecraft:load_ui", uiOptions)

    let playerData = system.createEventData("wits:send_player");
    playerData.data.player = eventData.data.player;
    system.broadcastEvent("wits:send_player", playerData);
}

function checkBlock(eventData) {
    if (eventData.data !== null && eventData.data.position !== null) {
        let blockEventData = system.createEventData("wits:fetch_block");
        blockEventData.data.position.x = eventData.data.position.x;
        blockEventData.data.position.y = eventData.data.position.y;
        blockEventData.data.position.z = eventData.data.position.z;
        blockEventData.data.player = player;
        system.broadcastEvent("wits:fetch_block", blockEventData);
    }
}

function updateUI(eventData) {
    if (eventData.data.player.id === player.id) {
        let uiEventData = {identifier: eventData.data.block.identifier.split(":").pop(), info: eventData.data.block.info, namespace: eventData.data.block.namespace};
        let uiEvent = system.createEventData("minecraft:send_ui_event");
        uiEvent.data.eventIdentifier = "wits:block_update";
        uiEvent.data.data = JSON.stringify(uiEventData);
        system.broadcastEvent("minecraft:send_ui_event", uiEvent);
    }
}

function hideUI(eventData) {
    let uiEvent = system.createEventData("minecraft:send_ui_event");
    uiEvent.data.eventIdentifier = "wits:hide_ui";
    uiEvent.data.data = "";
    system.broadcastEvent("minecraft:send_ui_event", uiEvent);
}