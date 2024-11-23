package video

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func HandleVideo(router *mux.Router) {
	router.HandleFunc("/video", OptionsHandler).Methods("OPTIONS")
	router.HandleFunc("/video", postVideo).Methods("POST")
	router.HandleFunc("/video", getVideo).Methods("GET")
}

type VideoData struct {
	Data string `json:"video"`
}

var videoBuffer = []string{}

func postVideo(w http.ResponseWriter, r *http.Request) {
	var videoData VideoData

	if err := json.NewDecoder(r.Body).Decode(&videoData); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	log.Println(string(videoData.Data))
	videoBuffer = append(videoBuffer, videoData.Data)

	w.WriteHeader(http.StatusCreated)
} 

func getVideo(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(videoBuffer)
	videoBuffer = []string{}
}
