class AddEventToNinjas < ActiveRecord::Migration[7.0]
  def change
    add_reference :ninjas, :event, null: false, foreign_key: true
  end
end
