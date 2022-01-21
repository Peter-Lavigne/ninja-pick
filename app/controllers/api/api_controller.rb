class Api::ApiController < ApplicationController
  before_action :authenticate_user!, only: %i[ picks updatePicks ]

  def leaderboard
    events = Event.where(finished: true).order(created_at: :desc).all
    render json: {
      users: User.all.map do |user|
        {
          name: user.name,
          events: events.map do |event|
            scores = scores_for_event(user, event)
            {
              id: event.id,
              name: event.name,
              score: scores[:score],
              correct_picks: scores[:correct_picks],
              top_three: scores[:top_three]
            }
          end
        }
      end,
      signed_in: user_signed_in?
    }
  end

  def event
    data = params.permit(:event_id)
    event = Event.find(data[:event_id])

    render json: {
      event: {
        name: event.name,
        finished: event.finished,
        ninjas: event.ninjas.map do |ninja|
          {
            name: ninja.name,
            sex: ninja.sex,
            position: ninja.position
          }
        end,
        picks: event.picks.map do |pick|
          {
            user: {
              name: pick.user.name,
              id: pick.user.id
            },
            ninja: {
              name: pick.ninja.name,
              sex: pick.ninja.sex,
              position: pick.ninja.position
            },
            placement: pick.placement
          }
        end
      },
      organizer: current_user&.organizer?
    }
  end

  def events
    render json: {
      events: Event.all.map do |event|
        {
          id: event.id,
          name: event.name,
          finished: event.finished
        }
      end,
      organizer: current_user&.organizer?
    }
  end

  def get_picks
    data = params.permit(:event_id)
    event = Event.find(data[:event_id])

    render json: {
      event: {
        id: event.id,
        name: event.name
      },
      ninjas: event.ninjas.map do |ninja|
        {
          id: ninja.id,
          sex: ninja.sex,
          name: ninja.name
        }
      end,
      picks: current_user.picks.where(event: event).map do |pick|
        {
          ninja_id: pick.ninja_id,
          placement: pick.placement
        }
      end
    }
  end

  def update_picks
    data = params.permit(
      :event_id,
      picks: [
        :ninja_id,
        :placement
      ]
    )

    event = Event.find(data[:event_id])

    return if event.finished?

    ActiveRecord::Base.transaction do
      event.picks.where(user: current_user).destroy_all
      data[:picks].each do |pick|
        event.picks.create!(
          user: current_user,
          ninja_id: pick[:ninja_id],
          placement: pick[:placement]
        )
      end
    end
  end

  private

  def scores_for_event(user, event)
    ninjas = event.ninjas
    picks = user.picks.where(event: event).joins(:ninja)
    
    score = 0
    correct_picks = 0
    top_three_male = true
    top_three_female = true
    male_count = ninjas.where(sex: 'male').size
    female_count = ninjas.where(sex: 'female').size
    (0..2).each do |placement|
      if pick = picks.find_by(placement: placement, ninja: { sex: 'male'} )
        distance = (pick.placement - pick.ninja.position).abs
        score += [5, 3, 2][placement] * (male_count - distance)
        if distance == 0
          correct_picks += 1
        else
          top_three_male = false
        end
      else
        top_three_male = false
      end

      if pick = picks.find_by(placement: placement, ninja: { sex: 'female'} )
        distance = (pick.placement - pick.ninja.position).abs
        score += [5, 3, 2][placement] * (female_count - distance)
        if distance == 0
          correct_picks += 1
        else
          top_three_female = false
        end
      else
        top_three_female = false
      end
    end

    score = score + correct_picks * 10
    
    {
      score: score,
      correct_picks: correct_picks,
      top_three: (top_three_male ? 1 : 0) + (top_three_female ? 1 : 0)
    }
  end
end
