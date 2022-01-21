Rails.application.routes.draw do
  resources :events do
    resources :picks
  end
  root "pages#home"

  get 'pages/home'
  devise_for :users, controllers: { omniauth_callbacks: 'users/omniauth_callbacks' }

  # devise_scope :user do
  #   delete 'sign_out', :to => 'devise/sessions#destroy', :as => :destroy_user_session
  # end

  namespace :api do
    get 'leaderboard', to: 'api#leaderboard'
    get 'events', to: 'api#events'
    get 'events/:event_id', to: 'api#event'
    get 'events/:event_id/picks', to: 'api#get_picks'
    post 'events/:event_id/picks', to: 'api#update_picks'
  end
end
