class AddPositionToNinjas < ActiveRecord::Migration[7.0]
  def change
    add_column :ninjas, :position, :integer, null: true
  end
end
