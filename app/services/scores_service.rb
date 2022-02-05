class ScoresService
  # implicit assumption: the event is finished
  def self.pick_score(pick)
    ninja_count = pick.event.ninjas.where(sex: pick.ninja.sex).size
    distance = (pick.placement - pick.ninja.position).abs
    [5, 3, 2][pick.placement] * (ninja_count - distance) + (distance === 0 ? 10 : 0)
  end

  # implicit assumption: the event is finished
  def self.leaderboard_scores(user, event)
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
        distance = (placement - pick.ninja.position).abs
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
        distance = (placement - pick.ninja.position).abs
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