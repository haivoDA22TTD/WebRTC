package web.rtc.room.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "rooms")
public class Room {
    @Id
    private String id;
    
    private String name;
    
    @Indexed(unique = true)
    private String code;
    
    private String hostId;
    private List<Participant> participants = new ArrayList<>();
    private boolean isActive = true;
    private RoomSettings settings = new RoomSettings();
    private Instant createdAt = Instant.now();

    public Room() {}

    public Room(String name, String code, String hostId) {
        this.name = name;
        this.code = code;
        this.hostId = hostId;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getHostId() { return hostId; }
    public void setHostId(String hostId) { this.hostId = hostId; }
    
    public List<Participant> getParticipants() { return participants; }
    public void setParticipants(List<Participant> participants) { this.participants = participants; }
    
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    
    public RoomSettings getSettings() { return settings; }
    public void setSettings(RoomSettings settings) { this.settings = settings; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
