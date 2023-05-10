handlers.JoinOrCreateRoomFunction = function (args, context) {
    var entityType = "Room";
    var roomTag = "Open";
    var maxPlayersPerRoom = 3;

    // Search for an open room
    var query = {
        "EntityType": entityType,
        "Tag": roomTag
    };

    var getEntitiesResult = entity.GetEntities(query);

    var roomEntity;
    if (getEntitiesResult.Entities.length > 0) {
        // Found an open room, use the first one
        roomEntity = getEntitiesResult.Entities[0];
    } else {
        // No open rooms found, create a new one
        var createEntityRequest = {
            "EntityType": entityType,
            "Entity": {
                "Id": currentPlayerId, // Set the current player as the creator
                "Type": entityType
            },
            "EntityToken": entity.GetEntityToken()
        };

        var createEntityResult = entity.CreateEntity(createEntityRequest);

        roomEntity = {
            "Id": createEntityResult.Entity.Id,
            "Type": entityType
        };
    }

    // Add the current player to the room and update the room's data
    var roomData = entity.GetObject(roomEntity, "RoomData");
    if (!roomData) {
        roomData = {
            "playerCount": 0,
            "players": []
        };
    }

    roomData.playerCount++;
    roomData.players.push(currentPlayerId);

    var setObjectResult = entity.SetObject(roomEntity, "RoomData", roomData);

    // If the room is now full, update its tag to indicate it's closed
    if (roomData.playerCount >= maxPlayersPerRoom) {
        var updateEntityRequest = {
            "Entity": roomEntity,
            "EntityToken": entity.GetEntityToken(),
            "Tag": "Closed"
        };

        var updateEntityResult = entity.UpdateEntity(updateEntityRequest);
    }

    return {
        "roomId": roomEntity.Id,
        "players": roomData.players
    };
};
