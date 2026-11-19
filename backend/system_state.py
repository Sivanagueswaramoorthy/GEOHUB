import json
from datetime import datetime
from typing import Dict, Any, Optional

# In-memory singleton representing current system infrastructure status
GLOBAL_SYSTEM_STATUS: Dict[str, Any] = {
    "is_backend_active": True,
    "is_db_connected": True,
    "updated_at": None,
    "updated_by": "System",
}

def load_system_status_from_db():
    """Loads persisted system status (backend active & db connected) from TiDB Cloud."""
    from database import SessionLocal
    import models

    db = SessionLocal()
    try:
        record = db.query(models.RolePermissionOverride).filter(
            models.RolePermissionOverride.role == "system_status"
        ).first()
        if record and record.overrides_json:
            data = json.loads(record.overrides_json)
            if "is_backend_active" in data:
                GLOBAL_SYSTEM_STATUS["is_backend_active"] = bool(data["is_backend_active"])
            if "is_db_connected" in data:
                GLOBAL_SYSTEM_STATUS["is_db_connected"] = bool(data["is_db_connected"])
            GLOBAL_SYSTEM_STATUS["updated_at"] = data.get("updated_at")
            GLOBAL_SYSTEM_STATUS["updated_by"] = data.get("updated_by", "System")
            print(f"[SystemState] Loaded system status from TiDB: backend_active={GLOBAL_SYSTEM_STATUS['is_backend_active']}, db_connected={GLOBAL_SYSTEM_STATUS['is_db_connected']}")
    except Exception as e:
        print(f"[SystemState Warning] Could not load system_status: {e}")
    finally:
        db.close()

def save_system_status(
    is_backend_active: Optional[bool] = None,
    is_db_connected: Optional[bool] = None,
    updated_by: str = "SuperAdmin"
) -> Dict[str, Any]:
    """Updates in-memory system status and commits it to TiDB Cloud."""
    from database import SessionLocal
    import models

    if is_backend_active is not None:
        GLOBAL_SYSTEM_STATUS["is_backend_active"] = bool(is_backend_active)
    if is_db_connected is not None:
        GLOBAL_SYSTEM_STATUS["is_db_connected"] = bool(is_db_connected)
    now_iso = datetime.utcnow().isoformat()
    GLOBAL_SYSTEM_STATUS["updated_at"] = now_iso
    GLOBAL_SYSTEM_STATUS["updated_by"] = updated_by

    db = SessionLocal()
    try:
        record = db.query(models.RolePermissionOverride).filter(
            models.RolePermissionOverride.role == "system_status"
        ).first()
        if not record:
            record = models.RolePermissionOverride(
                role="system_status",
                overrides_json=json.dumps(GLOBAL_SYSTEM_STATUS),
                updated_by=updated_by
            )
            db.add(record)
        else:
            record.overrides_json = json.dumps(GLOBAL_SYSTEM_STATUS)
            record.updated_by = updated_by
            record.updated_at = datetime.utcnow()
        db.commit()
        print(f"[SystemState] Saved system status to TiDB: backend_active={GLOBAL_SYSTEM_STATUS['is_backend_active']}, db_connected={GLOBAL_SYSTEM_STATUS['is_db_connected']}")
    except Exception as e:
        print(f"[SystemState Warning] Could not persist system_status: {e}")
        db.rollback()
    finally:
        db.close()

    return GLOBAL_SYSTEM_STATUS
