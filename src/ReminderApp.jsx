import { useState, useEffect} from "react";
import "./reminder.css";

const timers = {};

function scheduleTimer(id, isoTime, onFire) {
  cancelTimer(id);
  const delay = new Date(isoTime).getTime() - Date.now();
  if (delay > 0) {
    timers[id] = setTimeout(() => {
      onFire();
      delete timers[id];
    }, delay);
  }
}

function cancelTimer(id) {
  if (timers[id]) {
    clearTimeout(timers[id]);
    delete timers[id];
  }
}

function cancelAll() {
  Object.keys(timers).forEach(cancelTimer);
}

export default function ReminderApp() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("reminders") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    cancelAll();
    items.forEach(r =>
      scheduleTimer(r.id, r.time, () => fireNotification(r))
    );
    localStorage.setItem("reminders", JSON.stringify(items));
  }, [items]);

  function fireNotification(r) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Reminder", { body: r.text });
    } else {
      alert(`Reminder: ${r.text}`);
    }
  }

  const addItem = e => {
    e.preventDefault();
    const text = e.target.text.value.trim();
    const time = e.target.time.value;
    if (!text || !time) return;
    setItems(prev => [...prev, { id: crypto.randomUUID(), text, time }]);
    e.target.reset();
  };

  const deleteItem = id => {
    cancelTimer(id);
    setItems(prev => prev.filter(r => r.id !== id));
  };

  const fmt = iso =>
    new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  const now = Date.now();
  const upcoming = items.filter(r => new Date(r.time).getTime() >= now);
  const past = items.filter(r => new Date(r.time).getTime() < now);

  return (
    <div className="wrapper">
      <h1 className="title">My Reminders</h1>

      <form className="card form" onSubmit={addItem}>
        <input name="text" placeholder="What shouldn't I forget?" />
        <input name="time" type="datetime-local" />
        <button className="btn">Add</button>
      </form>

      <ReminderList
        heading="Upcoming"
        data={upcoming}
        fmt={fmt}
        onDelete={deleteItem}
        color="primary"
      />
      {past.length > 0 && (
        <ReminderList
          heading="Past"
          data={past}
          fmt={fmt}
          onDelete={deleteItem}
          color="muted"
        />
      )}
    </div>
  );
}

function ReminderList({ heading, data, fmt, onDelete, color }) {
  return (
    <section className={`card list ${color}`}>
      <h2 className="listTitle">{heading}</h2>
      {data.length === 0 ? (
        <p className="empty">No reminders.</p>
      ) : (
        <ul>
          {data
            .sort((a, b) => new Date(a.time) - new Date(b.time))
            .map(r => (
              <li key={r.id}>
                {r.text} — {fmt(r.time)}
                <button className="deleteBtn" onClick={() => onDelete(r.id)}>
                  🗑
                </button>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}
