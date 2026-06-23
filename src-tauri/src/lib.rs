use std::fs;
use tauri::Manager;

#[tauri::command]
fn load_state(app: tauri::AppHandle) -> String {
    if let Ok(dir) = app.path().app_data_dir() {
        let path = dir.join("clock-state.json");
        if let Ok(content) = fs::read_to_string(path) {
            return content;
        }
    }
    String::new()
}

#[tauri::command]
fn save_state(app: tauri::AppHandle, state: String) {
    if let Ok(dir) = app.path().app_data_dir() {
        let _ = fs::create_dir_all(&dir);
        let path = dir.join("clock-state.json");
        let _ = fs::write(path, state);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![load_state, save_state])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
